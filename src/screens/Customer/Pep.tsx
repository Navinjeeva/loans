
import React from "react";
import Header from "@src/common/components/Header";
import { useTheme } from "@src/common/utils/ThemeContext";
import { StyleSheet, View, Text, SafeAreaView, Switch, TextInput } from "react-native";
import KeyboardAwareScrollView from "@src/common/components/KeyboardAwareScrollView";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "@src/store/customer";
const Pep = () => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const dispatch = useDispatch();
    const pep = useSelector((state: any) => state.customer.pep);

    // Initialize PEP data if it doesn't exist
    React.useEffect(() => {
        if (!pep) {
            dispatch(setState({
                pep: {
                    isHeadOfState: false,
                    isHeadOfGovt: false,
                    isSenPolitician: false,
                    isSenGovtOfficial: false,
                    isSenJudicialOfficial: false,
                    isSenMilitaryOfficial: false,
                    isSenExecSOC: false,
                    isImpPPO: false,
                    isImmediateFamily: false,
                    isMemberOfSeniorManagement: false,
                    isPepAssociate: false,
                    additionalPepInfo: '',
                }
            }));
        }
    }, [pep, dispatch]);

    const updatePepData = (data: any) => {
        dispatch(setState({ pep: { ...pep, ...data } }));
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header title="Pep" subTitle="Pep" />
            <KeyboardAwareScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "space-between",
                        marginBottom: hp(2),
                    }}
                >
                    <View
                        style={{
                            flexDirection: "column",
                            gap: wp(5),
                            marginTop: wp(4),
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>Head of State</Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isHeadOfState ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isHeadOfState: value,
                                    })
                                }
                                value={pep?.isHeadOfState || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>Head of Government</Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isHeadOfGovt ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isHeadOfGovt: value,
                                    })
                                }
                                value={pep?.isHeadOfGovt || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>Senior Politician</Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isSenPolitician ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isSenPolitician: value,
                                    })
                                }
                                value={pep?.isSenPolitician || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Senior Government Official
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isSenGovtOfficial ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isSenGovtOfficial: value,
                                    })
                                }
                                value={pep?.isSenGovtOfficial || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Senior Judicial Official
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isSenJudicialOfficial ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isSenJudicialOfficial: value,
                                    })
                                }
                                value={pep?.isSenJudicialOfficial || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Senior Military Official
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isSenMilitaryOfficial ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isSenMilitaryOfficial: value,
                                    })
                                }
                                value={pep?.isSenMilitaryOfficial || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Senior Executive of State-Owned Corporations
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isSenExecSOC ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isSenExecSOC: value,
                                    })
                                }
                                value={pep?.isSenExecSOC || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Important Political Party Official
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isImpPPO ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isImpPPO: value,
                                    })
                                }
                                value={pep?.isImpPPO || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Immediate Family Member of Individuals described above
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isImmediateFamily ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isImmediateFamily: value,
                                    })
                                }
                                value={pep?.isImmediateFamily || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Persons who are or have been entrusted with prominent
                                functions by an International Organization which refers to
                                member of senior management
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={
                                    pep?.isMemberOfSeniorManagement ? "#E3781C" : "white"
                                }
                                onValueChange={(value) =>
                                    updatePepData({
                                        isMemberOfSeniorManagement: value,
                                    })
                                }
                                value={pep?.isMemberOfSeniorManagement || false}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={styles.switchLabels}>
                                Close Personal or Professional Associate of the PEP
                            </Text>
                            <Switch
                                trackColor={{ false: "#DADADA", true: "#FEB449" }}
                                thumbColor={pep?.isPepAssociate ? "#E3781C" : "white"}
                                onValueChange={(value) =>
                                    updatePepData({
                                        isPepAssociate: value,
                                    })
                                }
                                value={pep?.isPepAssociate || false}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default Pep;

const createStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(4),
        },
        switchLabels: {
            fontSize: wp(4),
            fontWeight: '500',
            color: colors.text,
            flex: 1,
            marginRight: wp(2),
        },
        additionalInfoLabel: {
            fontSize: wp(4),
            fontWeight: '500',
            color: colors.text,
            marginBottom: wp(2),
        },
        additionalInfoInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: wp(2),
            padding: wp(3),
            fontSize: wp(3.5),
            color: colors.text,
            backgroundColor: colors.background,
            textAlignVertical: 'top',
            minHeight: hp(10),
        },
    });