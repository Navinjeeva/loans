import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NavigationOptions } from "@src/common";
import { useEffect } from "react";

export default function useHideBottomBar() {
  const navigation = useNavigation<NavigationOptions>();
  const isFocus = useIsFocused();

  useEffect(() => {
    if (navigation?.getState()?.routes?.length > 1) {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
        tabBarVisible: false,
      });
    } else {
      navigation
        .getParent()
        ?.setOptions({ tabBarStyle: undefined, tabBarVisible: undefined });
    }
  }, [isFocus]);
}
