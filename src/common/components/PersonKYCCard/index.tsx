import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DocumentUploader from "../DocumentUploader";
import { useTheme } from "@src/common/ThemeContext";
import { ChevronDownPersonKYC as ChevronDown} from "@src/common/svg/CorporateLoansSvgs/index"



// ── Helpers ──
const colorFor = (s: string, palette: string[]) => {
  let n = 0;
  for (let i = 0; i < s.length; i++) n += s.charCodeAt(i);
  return palette[n % palette.length];
};
const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export type KycDoc = {
  id: string;
  name: string;
  required?: boolean;
};
export type KycEntry = {
  status: "uploaded" | "pending" | "rejected";
  fileName?: string;
  size?: string;
};

interface PersonKYCCardProps {
  /** Stable id (used to namespace doc ids) */
  id: string;
  /** Person display name */
  name: string;
  /** Role / type subtitle (e.g. "Managing Director", "Holding Company") */
  role: string;
  /** Avatar background — defaults to a deterministic hash of the name */
  avatarColor?: string;

  /** Per-person KYC docs */
  docs: KycDoc[];
  /** Doc uploads keyed by `kyc_${personId}_${docId}` */
  uploads?: Record<string, KycEntry>;
  /** Live upload progress keyed by the same `kyc_${personId}_${docId}` key */
  uploadProgress?: Record<string, number>;

  /** Fires when Upload tapped */
  onUpload?: (docId: string, docName: string) => void;
  /** Fires when 3-dot menu tapped (uploaded state) */
  onMenu?: (docId: string) => void;
  /** Fires when download-template tapped */
  onDownloadTemplate?: (docId: string) => void;

  /** Default to closed; pass true to render expanded initially */
  defaultOpen?: boolean;
}

const PersonKYCCard = ({
  id,
  name,
  role,
  avatarColor,
  docs,
  uploads = {},
  uploadProgress = {},
  onUpload,
  onMenu,
  onDownloadTemplate,
  defaultOpen = false,
}: PersonKYCCardProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(defaultOpen);

  const done = docs.filter((d) => uploads[`kyc_${id}_${d.id}`]?.status === "uploaded")
    .length;
  const total = docs.length;
  const bgColor = avatarColor || colorFor(id || name, colors.avatarPalette);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setOpen((o) => !o)}
        style={styles.header}
      >
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initialsOf(name)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.role} numberOfLines={1}>
            {role} · {done} of {total} uploaded
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {done}/{total}
          </Text>
        </View>
        <ChevronDown open={open} color={colors.faint} />
      </TouchableOpacity>

      {open && (
        <View style={styles.body}>
          {docs.map((d) => {
            const key = `kyc_${id}_${d.id}`;
            const entry = uploads[key];
            const uploaded = entry?.status === "uploaded";
            return (
              <View key={d.id} style={{ marginBottom: 8 }}>
                <DocumentUploader
                  name={d.name}
                  required={d.required}
                  status={uploaded ? "uploaded" : "empty"}
                  fileType={entry?.fileName?.split(".").pop()?.toUpperCase() || "PDF"}
                  fileSize={entry?.size}
                  progress={uploadProgress[key]}
                  onUpload={() => onUpload?.(key, d.name)}
                  onMenu={() => onMenu?.(key)}
                  onDownloadTemplate={() => onDownloadTemplate?.(key)}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default PersonKYCCard;

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarText: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    name: { fontSize: 14, fontWeight: "700", color: colors.ink },
    role: { fontSize: 12, color: colors.muted, marginTop: 2 },
    countPill: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 99,
      backgroundColor: colors.buttonDisabledBackground,
      minWidth: 36,
      alignItems: "center",
    },
    countText: { fontSize: 11.5, fontWeight: "700", color: colors.muted },

    body: {
      paddingHorizontal: 14,
      paddingBottom: 14,
      paddingTop: 4,
    },
  });
