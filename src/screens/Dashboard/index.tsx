import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles.tsx';

const DocumentStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();

const DocumentNavigator = () => (
  <DocumentStack.Navigator screenOptions={{ headerShown: false }}>
    <DocumentStack.Screen name="Documents" component={Documents} />
  </DocumentStack.Navigator>
);

export const DASHBOARDSTACK = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="DocumentNavigator" component={DocumentNavigator} />
  </Stack.Navigator>
);

const Dashboard = () => {
  useHideBottomBar();

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [performanceDateFilter, setPerformanceDateFilter] = useState('TODAY');
  const [transactionsDateFilter, setTransactionsDateFilter] = useState('TODAY');
  const [transactionOptionType, setTransactionOptionType] = useState(
    'i-Teller Transactions',
  );
  const [summaryCardsData, setSummaryCardsData] = useState({
    // cashBalance: "",
    documentsCount: '',
    chequesCount: '',
  });
  const [pointsData, setPointsData] = useState();
  const [selectedTaskCategory, setSelectedTaskCategory] = useState(0);

  const [instrumentsCount, setInstrumentsCount] = useState(0);
  const [documentCount, setDocumentsCount] = useState(0);

  const summaryData = [
    {
      icon: applicationsIcon,
      value: '500',
      label: 'Applications',
      subLabel: 'Completed',
    },
    {
      icon: transactionsIcon,
      value: '240',
      label: 'Transactions',
      subLabel: 'Processed',
    },
    {
      icon: frameIcon,
      value: '230',
      label: 'Instruments',
      subLabel: 'Issued',
    },
  ];

  const recentActivitiesData = [
    {
      type: 'application',
      title: 'Application #1234 Completed',
      description: 'Approved by John Mathews',
      time: '2 minutes ago',
    },
    {
      type: 'transaction',
      title: 'Transaction Processed',
      description: 'Processed via IMPS gateway',
      time: '5 minutes ago',
    },
    {
      type: 'cash',
      title: 'Cash Deposited',
      description: 'Deposited by Karthik R',
      time: '10 minutes ago',
    },
  ];

  useEffect(() => {
    fetchInstrumentsCount();
    fetchDocumentsCount();
  }, []);

  const fetchInstrumentsCount = async () => {
    setLoading(true);
    try {
      const response = await instance.get('api/cheques/instruments');
      const array = response.data?.data;
      setInstrumentsCount(array.length);
    } catch (err) {
      console.error('Error fetching data', err);
    }
    setLoading(false);
  };

  const fetchDocumentsCount = async () => {
    setLoading(true);
    try {
      const response = await instance.get('api/documents/documents');
      const array = response.data?.data;
      setDocumentsCount(array.length);
    } catch (err) {
      console.error('Error fetching data', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: notificationsData } = await instance.get(
          `api/v1/notification`,
        );
        dispatch(setState({ notifications: notificationsData.data }));
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const otherServicesTarget =
    (pointsData?.letterRequestTarget || 0) +
    (pointsData?.chequeRequestTarget || 0);
  const otherServicesAchieved =
    (pointsData?.chequeRequestAchieved || 0) +
    (pointsData?.letterRequestAchieved || 0);

  const taskCategories = [
    {
      title: 'Teller Transactions',
      target: pointsData?.transactionTarget || 0,
      achieved: pointsData?.transactionAchieved || 0,
      backgroundColor: '#F8F9FA',
    },
    {
      title: 'New Loan Applications',
      target: pointsData?.loanApplicationTarget || 0,
      achieved: pointsData?.loanApplicationAchieved || 0,
      backgroundColor: '#F8F9FA',
    },
    {
      title: 'New Member Onboarding',
      target: pointsData?.kymApplicationTarget || 0,
      achieved: pointsData?.kymApplicationAchieved || 0,
      backgroundColor: '#F8F9FA',
    },
    {
      title: 'Re-KYM Applications',
      target: pointsData?.reKymApplicationTarget || 0,
      achieved: pointsData?.reKymApplicationAchieved || 0,
      backgroundColor: '#F8F9FA',
    },
    {
      title: 'Cross Selling',
      target: pointsData?.crossSellingTarget || 0,
      achieved: pointsData?.crossSellingAchieved || 0,
      backgroundColor: '#F8F9FA',
    },
    {
      title: 'Other Services',
      target: otherServicesTarget,
      achieved: otherServicesAchieved,
      backgroundColor: '#F8F9FA',
    },
  ];

  const transactionOption = [
    {
      label: 'i-Branch Transactions',
      value: 'i-Branch Transactions',
    },
    {
      label: 'i-Teller Transactions',
      value: 'i-Teller Transactions',
    },
    {
      label: 'Other Services',
      value: 'Other Services',
    },
  ];

  const summaryCards = [
    {
      title: 'Cash Balance',
      value: summaryCardsData?.cashBalance,
      icon: '💵',
      backgroundColor: '#F1F9F0',
      path: 'cashBalanceNew',
      props: { balance: summaryCardsData?.cashBalance },
    },
    {
      title: 'Instruments',
      value: instrumentsCount,
      icon: '📝',
      backgroundColor: '#FFF9E6',
      path: 'instruments',
      props: {},
    },
    {
      title: 'Documents',
      value: documentCount,
      icon: '📄',
      backgroundColor: '#F0F8FF',
      path: 'documents',
      props: {},
    },
  ];

  const dateFilters = [
    { label: 'Today', value: 'TODAY' },
    { label: 'Yesterday', value: 'YESTERDAY' },
    { label: 'One Week', value: 'ONE_WEEK' },
    { label: 'One Month', value: 'ONE_MONTH' },
    { label: 'Three Month', value: 'THREE_MONTH' },
    { label: 'Six Month', value: 'SIX_MONTH' },
    { label: 'One Year', value: 'ONE_YEAR' },
  ];

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('filter', performanceDateFilter);
        const { data } = await instance.get(
          `/v1/api/dashboard/fetch-data?${queryParams.toString()}`,
        );
        setPointsData(data?.data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      }
    };
    fetchPerformanceData();
  }, [performanceDateFilter]);

  useEffect(() => {
    async function fetchSummaryAndTransactionData() {
      try {
        const [response2, response3] = await Promise.all([
          // instance.get(
          //   `/v1/api/dashboard/cash-balance?filter=${transactionsDateFilter}`
          // ),
          instance.get(
            `/v1/api/dashboard/fetch-Documents?filter=${transactionsDateFilter}`,
          ),
          instance.get(
            `/v1/api/dashboard/cheque-reports?filter=${transactionsDateFilter}`,
          ),
        ]);

        // const { netCashBalance } = response1?.data?.data || {};
        const { totalDocuments } = response2?.data?.data || {};
        const { totalChequeCount } = response3?.data?.data || {};

        setSummaryCardsData({
          // cashBalance: netCashBalance,
          documentsCount: totalDocuments,
          chequesCount: totalChequeCount,
        });
      } catch (error) {
        console.error(
          'Error while fetching summary/transaction data:',
          error.response?.data,
        );
      }
    }
    fetchSummaryAndTransactionData();
  }, [transactionsDateFilter]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const accessToken = await getData('access_token');
        const { data: profileData } = await authInstance.get(
          `api/v1/userrs/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              clientId: 'aMBankingClient',
            },
          },
        );

        dispatch(
          setState({
            profile: profileData.data,
          }),
        );
      } catch (error) {
        logErr(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPoints = pointsData?.totalPoints || 1;
  const completedPoints = pointsData?.completedPoints || 0;
  const overallProgressPercentage =
    totalPoints > 0 ? completedPoints / totalPoints : 0;

  const handleTaskCategoryPress = index => {
    setSelectedTaskCategory(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Loader loading={loading} />
      <View style={styles.HeaderContainer}>
        <View style={styles.profileContainer}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3) }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#f2702b30',
                borderRadius: 50,
                padding: 5,
              }}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image source={terri} style={styles.profileImage} />
            </TouchableOpacity>
            <View>
              <Text style={styles.welcomeBackText}>Welcome back,</Text>
              <Text style={styles.profileNameText}>
                {profileDetails?.firstName + ' ' + profileDetails?.lastName ||
                  ''}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: wp(4) }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notification')}
            >
              <Image style={styles.bellNotification} source={bellIcon} />
              {notifications.length > 0 && (
                <View style={styles.notificationBadge} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image style={styles.bellNotification} source={settings} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.taskOverviewSection}>
          <View style={styles.taskOverviewHeaderRow}>
            <Text style={styles.taskOverviewTitle}>Task Overview</Text>
            <View style={styles.taskOverviewDropdownWrapper}>
              <DropdownWithModal
                options={dateFilters}
                value={performanceDateFilter}
                isSearchable={false}
                setValue={date => setPerformanceDateFilter(date)}
                style={styles.taskOverviewDropdown}
              />
            </View>
          </View>
          <Text style={styles.taskOverviewSubTitle}>
            Track your progress and stay organized
          </Text>
          <View style={{ marginTop: hp(2) }}>
            <Text style={styles.taskOverviewSubTitle}>Progress</Text>
            <View style={styles.taskOverviewProgressBarContainer}>
              <Progress.Bar
                progress={overallProgressPercentage}
                width={wp(60)}
                height={hp(1.2)}
                color="#E3781C"
                unfilledColor="#FFEBD9"
                borderRadius={hp(0.6)}
                style={styles.taskOverviewProgressBar}
              />
              <View style={styles.taskOverviewProgressTextWrapper}>
                <Text style={styles.taskOverviewProgressText}>
                  {`${completedPoints}/${totalPoints}`}
                </Text>
                <Text style={styles.taskOverviewCompletedLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.performanceOverView}>
          <View style={{ marginLeft: wp(4), marginBottom: hp(1.5) }}>
            <Text style={styles.taskOverviewTitle}>Performance Overview</Text>
            <Text style={styles.taskOverviewSubTitle}>
              Track your progress and stay organized
            </Text>
          </View>

          <View style={styles.performanceOverviewSection}>
            <View style={styles.circularProgressWrapper}>
              <Text style={styles.circularProgressTitle}>
                Your{'\n'}Productivity
              </Text>
              <View style={styles.circularProgressContainer}>
                <Progress.Circle
                  size={wp(15)}
                  progress={overallProgressPercentage}
                  color="#FFFFFF"
                  unfilledColor="rgba(255, 255, 255, 0.2)"
                  borderWidth={0}
                  thickness={wp(2)}
                  showsText={false}
                />
                <View style={styles.circularProgressTextWrapper}>
                  <Text style={styles.circularProgressMainValue}>
                    {completedPoints}
                  </Text>
                  <Text style={styles.circularProgressTotalValue}>
                    /{totalPoints}
                  </Text>
                </View>
              </View>
              <Text style={styles.circularProgressLabel}>Progress</Text>
              <Text style={styles.circularProgressDescription}>
                {Math.round(overallProgressPercentage * 100)}% of today's tasks
              </Text>
              <Text style={styles.circularProgressDescription}>
                completed successfully
              </Text>
            </View>

            <View style={styles.taskCategoriesGrid}>
              {taskCategories.map((category, index) => (
                <PerformanceCard
                  key={index}
                  title={category.title}
                  achieved={category.achieved}
                  target={category.target}
                  isSelected={selectedTaskCategory === index}
                  onPress={() => handleTaskCategoryPress(index)}
                  backgroundColor={category.backgroundColor}
                />
              ))}
            </View>
          </View>
        </View>

        {/* --- Total Transactions Section (Main Card) --- */}
        <View style={styles.totalTransactionsContainer}>
          {/* <View style={styles.totalTransactionsHeader}>
            <Text style={styles.totalTransactionsTitle}>Total Transactions</Text>
            <TouchableOpacity
              style={styles.viewReportsButton}
              onPress={() => navigation.navigate("ViewReports")}
            >
              <Text style={styles.viewReportsButtonText}>View Reports</Text>
            </TouchableOpacity>
          </View> */}

          {/* Graph container with a different background */}
          <View style={styles.barGraphContainer}>
            <BarGraph
              selectedCategoryTitle={taskCategories[selectedTaskCategory].title}
              pointsData={pointsData}
            />
          </View>
        </View>

        {/* --- Summary Section --- */}
        <Summary summaryData={summaryData} />

        {/* --- Recent Activities Section --- */}
        <RecentActivities activitiesData={recentActivitiesData} />
      </KeyboardAwareScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Pressable
              onPress={() => {
                navigation.navigate('Profile');
                setModalVisible(false);
              }}
              style={styles.tile}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: hp(1.5),
                  flex: 1,
                }}
              >
                <Image source={user} style={styles.image} />
                <Text style={styles.modalText}>My Profile</Text>
                <Image style={styles.arrowStyle} source={arrow_right} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                navigation.navigate('Software');
                setModalVisible(false);
              }}
              style={styles.tile}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: hp(1.5),
                  flex: 1,
                }}
              >
                <Image source={smartphone} style={styles.image} />
                <Text style={styles.modalText}>About</Text>
                <Image style={styles.arrowStyle} source={arrow_right} />
              </View>
            </Pressable>

            <Pressable
              onPress={async () => {
                try {
                  setLoading(true);
                  const refreshToken = await getData('refresh_token');

                  const res = await authInstance.post(`/api/v2/auth/logout`, {
                    refreshToken: refreshToken,
                    clientId: 'aMBankingClient',
                  });

                  dispatch(
                    setState({
                      loggedIn: false,
                      access_token: '',
                      refresh_token: '',
                      memberId: '',
                    }),
                  );
                  await removeData('access_token');
                  await removeData('refresh_token');
                } catch (error) {
                  console.error(error?.response);
                  dispatch(
                    setState({
                      loggedIn: false,
                      access_token: '',
                      refresh_token: '',
                      memberId: '',
                    }),
                  );
                  await removeData('access_token');
                  await removeData('refresh_token');
                } finally {
                  setLoading(false);
                  setModalVisible(false);
                }
              }}
              style={[
                styles.tile,
                {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: hp(1.5),
                  flex: 1,
                }}
              >
                <Image source={logout} style={styles.image} />
                <Text style={styles.modalText}>Logout</Text>
                <Image style={styles.arrowStyle} source={arrow_right} />
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Dashboard;
