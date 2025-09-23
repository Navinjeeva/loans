import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import RNFS from 'react-native-fs';
import { back } from '@src/common/assets/icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageViewer = ({
  visible,
  setVisible,
  image,
  header = '',
  downloadAllowed = true,
  deleteAllowed = false,
  onDelete,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  image: string;
  header?: string;
  downloadAllowed?: boolean;
  deleteAllowed?: boolean;
  onDelete?: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const [currentScale, setCurrentScale] = useState(1);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<any>(null);

  // Gesture state tracking
  const gestureState = useRef({
    initialDistance: 0,
    initialScale: 1,
    isZooming: false,
    lastTouchCount: 0,
    initialTouches: [] as any[],
    baseTranslateX: 0,
    baseTranslateY: 0,
    initialCenterX: 0,
    initialCenterY: 0,
  }).current;

  useEffect(() => {
    if (visible) resetImage();
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, [visible]);

  const resetImage = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    setCurrentScale(1);
    setCurrentTranslateX(0);
    setCurrentTranslateY(0);
    gestureState.isZooming = false;
    gestureState.initialDistance = 0;
    gestureState.lastTouchCount = 0;
  };

  const getDistance = (touch1: any, touch2: any) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: any, touch2: any) => {
    return {
      x: (touch1.pageX + touch2.pageX) / 2,
      y: (touch1.pageY + touch2.pageY) / 2,
    };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: evt => {
      // console.log("Start should set - touches:", evt.nativeEvent.touches.length);
      return evt.nativeEvent.touches.length >= 1;
    },

    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches.length;
      //console.log("Move should set - touches:", touches, "dx:", gestureState.dx, "dy:", gestureState.dy);

      // Always capture multi-touch events immediately
      if (touches >= 2) return true;

      // For pan gestures when zoomed in, require some movement
      if (touches === 1 && currentScale > 1) {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      }

      // Allow small movements to potentially become gestures
      return Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1;
    },

    onPanResponderGrant: evt => {
      const touches = evt.nativeEvent.touches;
      //console.log("Grant - touches:", touches.length);

      gestureState.lastTouchCount = touches.length;
      gestureState.baseTranslateX = currentTranslateX;
      gestureState.baseTranslateY = currentTranslateY;

      if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        gestureState.initialDistance = getDistance(touch1, touch2);
        gestureState.initialScale = currentScale;
        gestureState.isZooming = true;
        gestureState.initialTouches = [...touches];

        const center = getCenter(touch1, touch2);
        gestureState.initialCenterX = center.x;
        gestureState.initialCenterY = center.y;

        //console.log("Pinch started - distance:", gestureState.initialDistance, "scale:", gestureState.initialScale);
      } else if (touches.length === 1) {
        gestureState.isZooming = false;
      }
    },

    onPanResponderMove: (evt, panGesture) => {
      const touches = evt.nativeEvent.touches;
      //console.log("Move - touches:", touches.length, "isZooming:", gestureState.isZooming, "initialDistance:", gestureState.initialDistance);

      if (touches.length === 2) {
        // Handle pinch zoom - Initialize if not already done
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentDistance = getDistance(touch1, touch2);

        // Initialize pinch if not already initialized
        if (!gestureState.isZooming || gestureState.initialDistance === 0) {
          gestureState.initialDistance = currentDistance;
          gestureState.initialScale = currentScale;
          gestureState.isZooming = true;
          gestureState.initialTouches = [...touches];

          const center = getCenter(touch1, touch2);
          gestureState.initialCenterX = center.x;
          gestureState.initialCenterY = center.y;

          // console.log("Pinch initialized in move - distance:", gestureState.initialDistance, "scale:", gestureState.initialScale);
          return; // Skip this frame to avoid division by zero
        }

        if (currentDistance > 0 && gestureState.initialDistance > 0) {
          const scaleRatio = currentDistance / gestureState.initialDistance;
          let newScale = gestureState.initialScale * scaleRatio;

          // Constrain scale between 0.5 and 5
          newScale = Math.max(0.5, Math.min(newScale, 2));

          //console.log("Pinch zoom - currentDistance:", currentDistance, "initialDistance:", gestureState.initialDistance, "scaleRatio:", scaleRatio, "newScale:", newScale);

          setCurrentScale(newScale);
          scale.setValue(newScale);

          // Calculate translation to keep zoom centered
          const center = getCenter(touch1, touch2);
          const screenCenterX = screenWidth / 2;
          const screenCenterY = screenHeight / 2;

          const deltaX = center.x - screenCenterX;
          const deltaY = center.y - screenCenterY;

          const newTranslateX = deltaX * (1 - newScale);
          const newTranslateY = deltaY * (1 - newScale);

          // Apply boundaries
          const maxTranslateX = (screenWidth * Math.abs(newScale - 1)) / 2;
          const maxTranslateY = (screenHeight * Math.abs(newScale - 1)) / 2;

          const constrainedX = Math.max(
            -maxTranslateX,
            Math.min(newTranslateX, maxTranslateX),
          );
          const constrainedY = Math.max(
            -maxTranslateY,
            Math.min(newTranslateY, maxTranslateY),
          );

          translateX.setValue(constrainedX);
          translateY.setValue(constrainedY);
          setCurrentTranslateX(constrainedX);
          setCurrentTranslateY(constrainedY);

          // Reset translation when zooming back to 1x or less
          if (newScale <= 1) {
            translateX.setValue(0);
            translateY.setValue(0);
            setCurrentTranslateX(0);
            setCurrentTranslateY(0);
          }
        }
      } else if (
        touches.length === 1 &&
        currentScale > 1 &&
        !gestureState.isZooming
      ) {
        // Handle pan when zoomed in
        const maxTranslateX = (screenWidth * (currentScale - 1)) / 2;
        const maxTranslateY = (screenHeight * (currentScale - 1)) / 2;

        let newTranslateX = gestureState.baseTranslateX + panGesture.dx;
        let newTranslateY = gestureState.baseTranslateY + panGesture.dy;

        // Apply boundaries
        newTranslateX = Math.max(
          -maxTranslateX,
          Math.min(newTranslateX, maxTranslateX),
        );
        newTranslateY = Math.max(
          -maxTranslateY,
          Math.min(newTranslateY, maxTranslateY),
        );

        translateX.setValue(newTranslateX);
        translateY.setValue(newTranslateY);
      }
    },

    onPanResponderRelease: (evt, panGesture) => {
      const touches = evt.nativeEvent.touches;
      //console.log("Release - touches:", touches.length, "remaining touches:", evt.nativeEvent.changedTouches.length);

      // Update current translate values after pan
      if (
        currentScale > 1 &&
        gestureState.lastTouchCount === 1 &&
        !gestureState.isZooming
      ) {
        const maxTranslateX = (screenWidth * (currentScale - 1)) / 2;
        const maxTranslateY = (screenHeight * (currentScale - 1)) / 2;

        let newTranslateX = gestureState.baseTranslateX + panGesture.dx;
        let newTranslateY = gestureState.baseTranslateY + panGesture.dy;

        newTranslateX = Math.max(
          -maxTranslateX,
          Math.min(newTranslateX, maxTranslateX),
        );
        newTranslateY = Math.max(
          -maxTranslateY,
          Math.min(newTranslateY, maxTranslateY),
        );

        setCurrentTranslateX(newTranslateX);
        setCurrentTranslateY(newTranslateY);
      }

      // Handle tap detection (only for single finger, small movement)
      if (
        !gestureState.isZooming &&
        gestureState.lastTouchCount === 1 &&
        Math.abs(panGesture.dx) < 10 &&
        Math.abs(panGesture.dy) < 10 &&
        evt.nativeEvent.changedTouches.length === 1
      ) {
        const tapX = evt.nativeEvent.pageX;
        const tapY = evt.nativeEvent.pageY;
        handleTap(tapX, tapY);
      }

      // Clean up gesture state
      if (evt.nativeEvent.touches.length === 0) {
        gestureState.initialDistance = 0;
        gestureState.isZooming = false;
        gestureState.lastTouchCount = 0;
        gestureState.initialTouches = [];
      }
    },

    onPanResponderTerminate: () => {
      //console.log("Gesture terminated");
      gestureState.isZooming = false;
      gestureState.initialDistance = 0;
      gestureState.lastTouchCount = 0;
    },

    // Add these properties to ensure multi-touch works
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => false,
  });

  const handleTap = (x: number, y: number) => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount === 1) {
      tapTimer.current = setTimeout(() => setTapCount(0), 300);
    } else if (newTapCount === 2) {
      clearTimeout(tapTimer.current);
      setTapCount(0);
      handleDoubleTap(x, y);
    }
  };

  const handleDoubleTap = (tapX: number, tapY: number) => {
    if (currentScale > 1.5) {
      // Zoom out to 1x
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      setCurrentScale(1);
      setCurrentTranslateX(0);
      setCurrentTranslateY(0);
    } else {
      // Zoom in to 2.5x at tap location
      const newScale = 2;
      const screenCenterX = screenWidth / 2;
      const screenCenterY = screenHeight / 2;
      const tx = ((screenCenterX - tapX) * (newScale - 1)) / newScale;
      const ty = ((screenCenterY - tapY) * (newScale - 1)) / newScale;
      const maxTranslateX = (screenWidth * (newScale - 1)) / 2;
      const maxTranslateY = (screenHeight * (newScale - 1)) / 2;
      const constrainedX = Math.max(
        -maxTranslateX,
        Math.min(tx, maxTranslateX),
      );
      const constrainedY = Math.max(
        -maxTranslateY,
        Math.min(ty, maxTranslateY),
      );

      Animated.parallel([
        Animated.timing(scale, {
          toValue: newScale,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateX, {
          toValue: constrainedX,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: constrainedY,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      setCurrentScale(newScale);
      setCurrentTranslateX(constrainedX);
      setCurrentTranslateY(constrainedY);
    }
  };

  const downloadPdf = async () => {
    const timeStamp = new Date().getTime();
    const downloadDest = `${RNFS.DownloadDirectoryPath}/downloaded_pdf_${timeStamp}.pdf`;
    try {
      Alert.alert('Download Successful', `PDF downloaded to ${downloadDest}`);
    } catch (err) {
      Alert.alert('Download Error', 'Failed to download PDF.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(prev => !prev)}
    >
      <View
        style={{
          alignItems: 'center',
          height: heightPercentageToDP(100),
          width: widthPercentageToDP(100),
          backgroundColor: '#fff',
        }}
      >
        {/* Header */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: heightPercentageToDP(2),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
            backgroundColor: '#fff',
          }}
        >
          <TouchableOpacity onPress={() => setVisible(!visible)}>
            <Image
              source={back}
              style={{
                height: heightPercentageToDP(3),
                width: widthPercentageToDP(3),
              }}
            />
          </TouchableOpacity>

          <Text
            style={{
              flex: 1,
              color: '#000',
              fontSize: heightPercentageToDP(2),
              fontWeight: 'bold',
              marginLeft: widthPercentageToDP(2.5),
            }}
            numberOfLines={1}
          >
            {header}
          </Text>

          <View style={{ width: heightPercentageToDP(3) + 20 }} />
        </View>

        {/* Image Area */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          {...panResponder.panHandlers}
        >
          <Animated.Image
            source={{ uri: image }}
            style={{
              width: screenWidth,
              height: screenHeight,
              resizeMode: 'contain',
              transform: [{ scale }, { translateX }, { translateY }],
            }}
          />
        </View>

        {/* Zoom indicator */}
        {currentScale > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 80,
              alignSelf: 'center',
              backgroundColor: 'rgba(255,255,255,0.8)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 15,
            }}
          >
            <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>
              {currentScale.toFixed(1)}x
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ImageViewer;
