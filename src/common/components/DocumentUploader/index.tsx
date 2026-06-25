import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "@src/common/ThemeContext";

// ── SVG icons (color is required; callers pass theme tokens) ──
const Sx = ({
  size = 16,
  color,
  stroke = 1.75,
  children,
}: {
  size?: number;
  color: string;
  stroke?: number;
  children: React.ReactNode;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);
const UploadIcon = (p: any) => (
  <Sx {...p} stroke={2.2}>
    <Path d="M12 16V5M8 9l4-4 4 4" />
    <Path d="M5 19h14" />
  </Sx>
);
const CheckIcon = (p: any) => (
  <Sx {...p} stroke={2.4}>
    <Path d="M20 6L9 17l-5-5" />
  </Sx>
);
const DotsIcon = (p: any) => (
  <Sx {...p}>
    <Circle cx={12} cy={5} r={1.6} fill={p.color} stroke="none" />
    <Circle cx={12} cy={12} r={1.6} fill={p.color} stroke="none" />
    <Circle cx={12} cy={19} r={1.6} fill={p.color} stroke="none" />
  </Sx>
);
const AlertIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M12 3l9 16H3z" />
    <Path d="M12 10v4M12 17h.01" />
  </Sx>
);
const RefreshIcon = (p: any) => (
  <Sx {...p} stroke={2.4}>
    <Path d="M4 12a8 8 0 0 1 13.5-5.8L20 8M20 4v4h-4" />
    <Path d="M20 12a8 8 0 0 1-13.5 5.8L4 16M4 20v-4h4" />
  </Sx>
);

export type DocStatus = "empty" | "uploaded" | "reupload";

interface DocumentUploaderProps {
  /** Document display name (e.g. "Certificate of Incorporation") */
  name: string;
  /** Is this required or optional? */
  required?: boolean;
  /** Show a "· Download template" link next to the Required/Optional flag */
  template?: boolean;
  /** When true, renders the "Download template" link as a tappable */
  onDownloadTemplate?: () => void;

  /** "empty" (default), "uploaded", or "reupload" */
  status?: DocStatus;
  /** File metadata shown when uploaded — e.g. "JPG", "PDF" */
  fileType?: string;
  /** File size shown when uploaded — e.g. "1.6 MB" */
  fileSize?: string;
  /** Re-upload reason (shown when status === "reupload") */
  reason?: string;

  /** Fires when the user taps the Upload button */
  onUpload?: () => void;
  /** Fires when the user taps the 3-dot menu in the uploaded state */
  onMenu?: () => void;
  /** When set (0–100), renders an in-progress upload row with progress bar */
  progress?: number;
}

const DocumentUploader = ({
  name,
  required = false,
  template = false,
  onDownloadTemplate,
  status = "empty",
  fileType = "PDF",
  fileSize,
  reason,
  onUpload,
  onMenu,
  progress,
}: DocumentUploaderProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // ── Uploading state (progress bar) ──
  if (progress != null) {
    const pct = Math.min(Math.max(progress, 0), 100);
    return (
      <View style={[styles.card, { borderColor: colors.brandBorder }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(pct)}%</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Uploaded state ──
  if (status === "uploaded") {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.metaMuted} numberOfLines={1}>
            {fileType}
            {fileSize ? ` · ${fileSize}` : ""}
          </Text>
        </View>
        <View style={styles.uploadedPill}>
          <CheckIcon size={14} color={colors.ink2} />
          <Text style={styles.uploadedText}>Uploaded</Text>
        </View>
        <TouchableOpacity onPress={onMenu} style={styles.menuBtn} hitSlop={6}>
          <DotsIcon size={17} color={colors.faint} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Re-upload state ──
  if (status === "reupload") {
    return (
      <View style={[styles.card, { borderColor: colors.dangerSoftBorder }]}>
        <View style={{ width: "100%" }}>
          <View style={styles.row}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.reuploadFlag}>
                <AlertIcon size={12} color={colors.danger} />
                <Text style={styles.reuploadText}>Re-upload required</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onUpload}
              activeOpacity={0.85}
              style={styles.reuploadBtn}
            >
              <RefreshIcon size={13} color={colors.muted} />
              <Text style={styles.reuploadBtnText}>Re-upload</Text>
            </TouchableOpacity>
          </View>
          {!!reason && (
            <View style={styles.reasonRow}>
              <AlertIcon size={13} color={colors.danger} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ── Empty / Upload state ──
  return (
    <View style={styles.card}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.metaFaint}>
          {required ? "Required" : "Optional"}
          {template ? (
            <>
              <Text style={styles.metaFaint}> · </Text>
              <Text
                onPress={onDownloadTemplate}
                style={styles.templateLink}
              >
                Download template
              </Text>
            </>
          ) : null}
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onUpload}
        style={[
          styles.uploadBtn,
          {
            backgroundColor: required ? colors.brand : colors.card,
            borderColor: required ? colors.brand : colors.borderLight,
          },
        ]}
      >
        <UploadIcon
          size={15}
          color={required ? colors.buttonText : colors.buttonPrimaryHover}
        />
        <Text
          style={[
            styles.uploadBtnText,
            { color: required ? colors.buttonText : colors.buttonPrimaryHover },
          ]}
        >
          Upload
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DocumentUploader;

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 11 },

    name: { fontSize: 12, fontWeight: "600", color: colors.ink },
    metaFaint: { fontSize: 11.5, color: colors.faint, marginTop: 3, fontWeight: "500" },
    metaMuted: { fontSize: 11.5, color: colors.muted, marginTop: 3, fontWeight: "500" },

    templateLink: { color: colors.buttonPrimaryHover, fontWeight: "600" },

    // ── Upload button (empty) ──
    uploadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      flexShrink: 0,
    },
    uploadBtnText: { fontSize: 13, fontWeight: "600" },

    // ── Uploaded ──
    uploadedPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      flexShrink: 0,
    },
    uploadedText: { fontSize: 13, fontWeight: "600", color: colors.ink2 },
    menuBtn: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    // ── Re-upload ──
    reuploadFlag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    reuploadText: { fontSize: 11.5, fontWeight: "600", color: colors.danger },
    reuploadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
      flexShrink: 0,
    },
    reuploadBtnText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    reasonRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 7,
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.dangerSoftBorder,
    },
    reasonText: {
      flex: 1,
      fontSize: 11.5,
      color: colors.danger,
      lineHeight: 16,
      fontWeight: "500",
    },

    // ── Upload progress ──
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginTop: 7,
    },
    progressTrack: {
      flex: 1,
      height: 4,
      borderRadius: 99,
      backgroundColor: colors.hairline,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.brand,
      borderRadius: 99,
    },
    progressText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.brand600,
      minWidth: 32,
      textAlign: "right",
    },
  });
