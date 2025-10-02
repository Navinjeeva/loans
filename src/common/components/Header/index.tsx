import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@src/common/utils/ThemeContext";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface HeaderProps {
    title: string;
    subTitle: string;
    onHelpPress?: () => void;
}

const Header = ({ title, subTitle, onHelpPress }: HeaderProps) => {

    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const navigation = useNavigation()


    return (

        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {title}
                </Text>
                <Text
                    style={[styles.headerSubtitle, { color: colors.textSecondary }]}
                >
                    {subTitle}
                </Text>
            </View>
            {onHelpPress && (
                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={onHelpPress}
                >
                    <Text style={[styles.helpIcon, { color: colors.primary }]}>?</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default Header

const createStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: hp(5),
        },
        header: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: wp(4),
            paddingTop: hp(2),
            paddingBottom: hp(1),
        },
        backButton: {
            marginRight: wp(4),
            marginTop: hp(0.5),
        },
        backIcon: {
            fontSize: hp(3),
            fontWeight: 'bold',
        },
        headerContent: {
            flex: 1,
        },
        headerTitle: {
            fontSize: hp(2.8),
            fontWeight: 'bold',
            marginBottom: hp(0.5),
        },
        headerSubtitle: {
            fontSize: hp(1.6),
            lineHeight: hp(2.2),
        },
        helpButton: {
            width: wp(8),
            height: wp(8),
            borderRadius: wp(4),
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(0.5),
        },
        helpIcon: {
            fontSize: hp(2.5),
            fontWeight: 'bold',
        },

    });