import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import {
  TextInputComponent,
  DropdownWithModal,
  DateInput,
  CurrencyInput,
} from "@src/common";
import MobileNumberInputComponent from "@src/common/components/MobileNumberComponent";
import Button from "@src/components/Button";
import StepHeader from "./StepHeader";
import { useDispatch, useSelector } from "react-redux";
import {
  setCompany,
  setRegOffice,
  setOpOffice,
  setFinancial,
  setDirectors,
} from "@src/store/corporate";

const BRAND = "#F97316";

const BUSINESS_TYPES = [
  { label: "Private Limited", value: "Private Limited" },
  { label: "LLP", value: "LLP" },
  { label: "Partnership", value: "Partnership" },
  { label: "Sole Proprietorship", value: "Sole Proprietorship" },
  { label: "Public Limited", value: "Public Limited" },
];

const INDUSTRIES = [
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Retail", value: "Retail" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Technology", value: "Technology" },
  { label: "Logistics", value: "Logistics" },
  { label: "Construction", value: "Construction" },
  { label: "Trading & Distribution", value: "Trading & Distribution" },
  { label: "Financial Services", value: "Financial Services" },
];

const COUNTRIES = [
  { label: "India", value: "India" },
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "UAE", value: "UAE" },
  { label: "Singapore", value: "Singapore" },
  { label: "Australia", value: "Australia" },
  { label: "Canada", value: "Canada" },
];

const INDIAN_STATES = [
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Delhi", value: "Delhi" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Telangana", value: "Telangana" },
  { label: "West Bengal", value: "West Bengal" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
];

interface ExpandableSectionProps {
  icon: string;
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  colors: any;
}

const ExpandableSection = ({
  icon,
  title,
  summary,
  defaultOpen = false,
  children,
  colors,
}: ExpandableSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <View style={[styles.sectionIconBox, { backgroundColor: "#FFF4EC" }]}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          {!open && summary ? (
            <Text style={[styles.sectionSummary, { color: colors.textSecondary }]} numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.chevron,
            { color: colors.textMuted, transform: [{ rotate: open ? "90deg" : "0deg" }] },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

const DESIGNATIONS = [
  { label: "Managing Director", value: "Managing Director" },
  { label: "Whole-time Director", value: "Whole-time Director" },
  { label: "Director", value: "Director" },
  { label: "Non-Executive Director", value: "Non-Executive Director" },
  { label: "Independent Director", value: "Independent Director" },
  { label: "Chief Executive Officer", value: "Chief Executive Officer" },
  { label: "Chief Financial Officer", value: "Chief Financial Officer" },
  { label: "Company Secretary", value: "Company Secretary" },
];

const AVATAR_COLORS = ["#C2185B", "#7B1FA2", "#1565C0", "#00695C", "#E65100", "#4527A0"];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(id: string) {
  const idx = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

const EMPTY_DIR = { name: "", designation: "", mobile: "", isdCode: "91", email: "", din: "", isOwner: false, ownership: "" };

const VerifyCompanyScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { company: c, financial: f, office, directors, onboardMode } = useSelector(
    (state: any) => state.corporate
  );
  const isAI = onboardMode === "ai";

  const set = (k: string, v: any) => dispatch(setCompany({ [k]: v }));
  const setFin = (k: string, v: any) => dispatch(setFinancial({ [k]: v }));
  const setOff = (sec: string, k: string, v: any) =>
    sec === "reg" ? dispatch(setRegOffice({ [k]: v })) : dispatch(setOpOffice({ [k]: v }));

  // Director modal state
  const [dirModal, setDirModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirForm, setDirForm] = useState({ ...EMPTY_DIR });

  const openAddDir = () => {
    setEditingId(null);
    setDirForm({ ...EMPTY_DIR });
    setDirModal(true);
  };

  const openEditDir = (d: any) => {
    setEditingId(d.id);
    setDirForm({ name: d.name, designation: d.designation, mobile: d.mobile, isdCode: d.isdCode || "91", email: d.email || "", din: d.din || "", isOwner: d.isOwner, ownership: d.ownership || "" });
    setDirModal(true);
  };

  const saveDir = () => {
    if (!dirForm.name || !dirForm.designation) return;
    if (editingId) {
      dispatch(setDirectors(directors.map((d: any) => d.id === editingId ? { ...d, ...dirForm } : d)));
    } else {
      const newId = String(Date.now());
      dispatch(setDirectors([...directors, { id: newId, ...dirForm }]));
    }
    setDirModal(false);
  };

  const deleteDir = (id: string) => {
    dispatch(setDirectors(directors.filter((d: any) => d.id !== id)));
  };

  const totalOwnership = directors.reduce((sum: number, d: any) => sum + (d.isOwner ? Number(d.ownership) || 0 : 0), 0);

  const companyComplete =
    !!c.country &&
    !!c.businessType &&
    !!c.name &&
    !!c.cin &&
    !!c.pan &&
    !!c.doi &&
    !!f.annualRevenue &&
    !!f.employeeCount &&
    directors.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader
        step={2}
        title={isAI ? "Verify company information" : "Company information"}
        onBack={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {isAI && (
          <View style={[styles.autoFillBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.bannerIcon, { backgroundColor: "#FFF4EC" }]}>
              <Text style={{ fontSize: 16 }}>🏢</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.text }]}>
                Company details auto-filled
              </Text>
              <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
                Review and edit any field before continuing.
              </Text>
            </View>
          </View>
        )}

        {/* 1 · Classification */}
        <ExpandableSection
          icon="🌐"
          title="Company classification"
          summary={[c.country, c.businessType, c.industry].filter(Boolean).join(" · ")}
          defaultOpen={!isAI}
          colors={colors}
        >
          <DropdownWithModal
            options={COUNTRIES}
            value={c.country}
            setValue={(v) => set("country", v)}
            placeholder="Select country"
            header="Country of Registration"
            label="Country of registration"
            required
          />
          <DropdownWithModal
            options={BUSINESS_TYPES}
            value={c.businessType}
            setValue={(v) => set("businessType", v)}
            placeholder="Select business type"
            header="Business Type"
            label="Business type"
            required
            isSearchable={false}
          />
          <DropdownWithModal
            options={INDUSTRIES}
            value={c.industry}
            setValue={(v) => set("industry", v)}
            placeholder="Select industry"
            header="Industry Type"
            label="Industry type"
            required
          />
        </ExpandableSection>

        {/* 2 · Company identity */}
        <ExpandableSection
          icon="🏢"
          title="Company identity"
          summary={c.name || "Tap to add"}
          defaultOpen={!isAI}
          colors={colors}
        >
          <TextInputComponent
            header="Registered company name"
            placeholder="Company Pvt Ltd"
            value={c.name}
            onChange={(v: string) => set("name", v)}
            required
          />
          <TextInputComponent
            header="CIN"
            placeholder="U29299MH2009PTC000000"
            value={c.cin}
            onChange={(v: string) => set("cin", v.toUpperCase().slice(0, 21))}
            required
            caps
            maxLength={21}
          />
          <TextInputComponent
            header="PAN"
            placeholder="AAFCM1234Q"
            value={c.pan}
            onChange={(v: string) =>
              set("pan", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))
            }
            required
            caps
            maxLength={10}
          />
          <TextInputComponent
            header="GST registration number"
            placeholder="27AAFCM1234Q1Z5"
            value={c.gst}
            onChange={(v: string) =>
              set("gst", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))
            }
            caps
            maxLength={15}
          />
          <DateInput
            label="Date of incorporation"
            date={c.doi}
            onDateChange={(v: string) => set("doi", v)}
            required
            placeholder="YYYY-MM-DD"
          />
        </ExpandableSection>

        {/* 3 · Registered office */}
        <ExpandableSection
          icon="📍"
          title="Registered office"
          summary={
            office.reg.city
              ? `${office.reg.city}, ${office.reg.state}`
              : "Tap to add"
          }
          colors={colors}
        >
          <DropdownWithModal
            options={COUNTRIES}
            value={office.reg.country || "India"}
            setValue={(v: string) => setOff("reg", "country", v)}
            placeholder="Select country"
            header="Country"
            label="Country"
            required
          />
          <DropdownWithModal
            options={INDIAN_STATES}
            value={office.reg.state}
            setValue={(v: string) => setOff("reg", "state", v)}
            placeholder="Select state"
            header="State"
            label="State"
            required
          />
          <TextInputComponent
            header="City"
            placeholder="City"
            value={office.reg.city}
            onChange={(v: string) => setOff("reg", "city", v)}
            required
          />
          <TextInputComponent
            header="Area / locality"
            placeholder="Area / locality"
            value={office.reg.locality}
            onChange={(v: string) => setOff("reg", "locality", v)}
            required
          />
          <TextInputComponent
            header="Building / office address"
            placeholder="Plot / Building / Street"
            value={office.reg.address}
            onChange={(v: string) => setOff("reg", "address", v)}
            required
            multiline
            numberOfLines={2}
          />
          <TextInputComponent
            header="PIN code"
            placeholder="400001"
            value={office.reg.postal}
            onChange={(v: string) =>
              setOff("reg", "postal", v.replace(/[^0-9]/g, "").slice(0, 6))
            }
            required
            keyboardType="numeric"
            maxLength={6}
          />
        </ExpandableSection>

        {/* 4 · Operational office */}
        <ExpandableSection
          icon="🏭"
          title="Operational office"
          summary={
            office.op.city
              ? `${office.op.city}, ${office.op.state}`
              : "Tap to add"
          }
          colors={colors}
        >
          <DropdownWithModal
            options={COUNTRIES}
            value={office.op.country || "India"}
            setValue={(v: string) => setOff("op", "country", v)}
            placeholder="Select country"
            header="Country"
            label="Country"
            required
          />
          <DropdownWithModal
            options={INDIAN_STATES}
            value={office.op.state}
            setValue={(v: string) => setOff("op", "state", v)}
            placeholder="Select state"
            header="State"
            label="State"
            required
          />
          <TextInputComponent
            header="City"
            placeholder="City"
            value={office.op.city}
            onChange={(v: string) => setOff("op", "city", v)}
            required
          />
          <TextInputComponent
            header="Area / locality"
            placeholder="Area / locality"
            value={office.op.locality}
            onChange={(v: string) => setOff("op", "locality", v)}
            required
          />
          <TextInputComponent
            header="Building / office address"
            placeholder="Plot / Building / Street"
            value={office.op.address}
            onChange={(v: string) => setOff("op", "address", v)}
            required
            multiline
            numberOfLines={2}
          />
          <TextInputComponent
            header="PIN code"
            placeholder="400001"
            value={office.op.postal}
            onChange={(v: string) =>
              setOff("op", "postal", v.replace(/[^0-9]/g, "").slice(0, 6))
            }
            required
            keyboardType="numeric"
            maxLength={6}
          />
        </ExpandableSection>

        {/* 5 · Directors */}
        <ExpandableSection
          icon="👥"
          title="Directors & owners"
          summary={
            directors.length > 0
              ? `${directors.length} director${directors.length > 1 ? "s" : ""} · ${totalOwnership}% shareholding`
              : "Tap to add"
          }
          colors={colors}
        >
          {directors.length > 0 && (
            <Text style={[styles.dirGroupLabel, { color: colors.textMuted }]}>DIRECTORS</Text>
          )}
          {directors.map((d: any) => (
            <View
              key={d.id}
              style={[styles.dirCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.dirAvatar, { backgroundColor: getAvatarColor(d.id) }]}>
                <Text style={styles.dirAvatarText}>{getInitials(d.name)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.dirName, { color: colors.text }]} numberOfLines={1}>{d.name}</Text>
                <Text style={[styles.dirRole, { color: colors.textSecondary }]}>{d.designation}</Text>
              </View>
              <TouchableOpacity
                onPress={() => openEditDir(d)}
                style={[styles.dirActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteDir(d.id)}
                style={[styles.dirActionBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}
              >
                <Text style={{ fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={openAddDir}
            style={[styles.addDirBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.addDirBtnText, { color: colors.text }]}>+ Add Director</Text>
          </TouchableOpacity>
        </ExpandableSection>

        {/* Director modal */}
        <Modal visible={dirModal} animationType="slide" transparent onRequestClose={() => setDirModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
              {/* Modal header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {editingId ? "Edit director" : "Add director"}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Director details · India (IN)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDirModal(false)}
                  style={[styles.modalCloseBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.modalCloseTxt, { color: colors.text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
                <TextInputComponent
                  header="Full name"
                  placeholder="Director name"
                  value={dirForm.name}
                  onChange={(v: string) => setDirForm((f: any) => ({ ...f, name: v }))}
                  required
                />
                <DropdownWithModal
                  options={DESIGNATIONS}
                  value={dirForm.designation}
                  setValue={(v: string) => setDirForm((f: any) => ({ ...f, designation: v }))}
                  placeholder="Select designation"
                  header="Designation"
                  label="Designation"
                  required
                />
                <View style={{ marginVertical: hp(0.8) }}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Mobile number <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <MobileNumberInputComponent
                    isdCode={dirForm.isdCode}
                    mobileNumber={dirForm.mobile}
                    onChangeMobileNumber={(v: string) => setDirForm((f: any) => ({ ...f, mobile: v }))}
                    onChangeIsdCode={(code: string | number) => setDirForm((f: any) => ({ ...f, isdCode: String(code) }))}
                  />
                </View>
                <TextInputComponent
                  header="Email address"
                  placeholder="name@company.com"
                  value={dirForm.email}
                  onChange={(v: string) => setDirForm((f: any) => ({ ...f, email: v }))}
                  required
                  keyboardType="email-address"
                />
                <TextInputComponent
                  header="DIN"
                  placeholder="02145673"
                  value={dirForm.din}
                  onChange={(v: string) => setDirForm((f: any) => ({ ...f, din: v.replace(/[^0-9]/g, "").slice(0, 8) }))}
                  required
                  keyboardType="numeric"
                  maxLength={8}
                />
                <Text style={[styles.dinHint, { color: colors.textMuted }]}>Director Identification Number</Text>

                {/* Owner toggle */}
                <View style={[styles.ownerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.ownerIcon, { backgroundColor: colors.card }]}>
                    <Text style={{ fontSize: 16 }}>%</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ownerTitle, { color: colors.text }]}>Is this person an owner?</Text>
                    <Text style={[styles.ownerDesc, { color: colors.textSecondary }]}>
                      Holds shares / profit-share in the company
                    </Text>
                  </View>
                  <Switch
                    value={dirForm.isOwner}
                    onValueChange={(v) => setDirForm((f: any) => ({ ...f, isOwner: v }))}
                    trackColor={{ false: colors.border, true: BRAND }}
                    thumbColor="#fff"
                  />
                </View>

                {dirForm.isOwner && (
                  <TextInputComponent
                    header="Ownership %"
                    placeholder="0"
                    value={dirForm.ownership}
                    onChange={(v: string) => setDirForm((f: any) => ({ ...f, ownership: v.replace(/[^0-9]/g, "").slice(0, 3) }))}
                    required
                    keyboardType="numeric"
                    maxLength={3}
                  />
                )}
              </ScrollView>

              <View style={[styles.modalFooter, { borderTopColor: colors.borderLight, backgroundColor: colors.card }]}>
                <Button
                  text="✓  Save details"
                  click={saveDir}
                  disabled={!dirForm.name || !dirForm.designation}
                  buttonStyle={styles.modalSaveBtn}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* 6 · Financial information */}
        <ExpandableSection
          icon="📊"
          title="Financial information"
          summary={
            f.annualRevenue
              ? `Revenue ₹${(+f.annualRevenue / 10000000).toFixed(1)} Cr`
              : "Tap to add"
          }
          colors={colors}
        >
          <CurrencyInput
            label="Annual revenue"
            value={f.annualRevenue ? Number(f.annualRevenue) : null}
            onChangeText={(v: number | null) => setFin("annualRevenue", v != null ? String(Math.round(v)) : "")}
            lableimp
            prefix="₹"
            placeholder="0"
          />
          <CurrencyInput
            label="Average monthly turnover"
            value={f.monthlyTurnover ? Number(f.monthlyTurnover) : null}
            onChangeText={(v: number | null) => setFin("monthlyTurnover", v != null ? String(Math.round(v)) : "")}
            lableimp
            prefix="₹"
            placeholder="0"
          />
          <CurrencyInput
            label="Net profit (FY)"
            value={f.netProfit ? Number(f.netProfit) : null}
            onChangeText={(v: number | null) => setFin("netProfit", v != null ? String(Math.round(v)) : "")}
            lableimp
            prefix="₹"
            placeholder="0"
          />
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <TextInputComponent
                header="Employees"
                placeholder="100"
                value={f.employeeCount}
                onChange={(v: string) => setFin("employeeCount", v.replace(/[^0-9]/g, ""))}
                required
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInputComponent
                header="Business vintage (yrs)"
                placeholder="10"
                value={f.vintage}
                onChange={(v: string) =>
                  setFin("vintage", v.replace(/[^0-9]/g, "").slice(0, 3))
                }
                required
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </ExpandableSection>

        <Text style={[styles.editNote, { color: colors.textMuted }]}>
          🔒 You can edit everything before submission
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.borderLight, backgroundColor: colors.background },
        ]}
      >
        <Button
          text="Confirm & Continue"
          click={() => navigation.navigate("CorporateLoan")}
          disabled={!companyComplete}
          buttonStyle={styles.footerBtn}
        />
      </View>
    </View>
  );
};

export default VerifyCompanyScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: wp(4),
    paddingBottom: hp(4),
    gap: hp(1.5),
  },
  autoFillBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    padding: hp(1.6),
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: { fontSize: hp(1.7), fontWeight: "600" },
  bannerDesc: { fontSize: hp(1.5), lineHeight: hp(2.2) },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: hp(0.5) },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp(1.8),
    gap: wp(3),
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: hp(1.7), fontWeight: "600" },
  sectionSummary: { fontSize: hp(1.5), marginTop: 2 },
  chevron: { fontSize: hp(2.6), fontWeight: "300" },
  sectionBody: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  rowFields: { flexDirection: "row", gap: wp(3) },
  dirGroupLabel: {
    fontSize: hp(1.35),
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  dirCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    padding: hp(1.5),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: hp(1),
  },
  dirAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dirAvatarText: { color: "#fff", fontSize: hp(1.7), fontWeight: "700" },
  dirName: { fontSize: hp(1.7), fontWeight: "600" },
  dirRole: { fontSize: hp(1.5), marginTop: 2 },
  dirActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  addDirBtn: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: hp(1.8),
    alignItems: "center",
    marginTop: hp(0.5),
  },
  addDirBtnText: { fontSize: hp(1.7), fontWeight: "600" },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: hp(2.2), fontWeight: "700" },
  modalSubtitle: { fontSize: hp(1.5), marginTop: 2 },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseTxt: { fontSize: hp(1.6), fontWeight: "600" },
  modalBody: { paddingHorizontal: wp(5), paddingTop: hp(1.5), paddingBottom: hp(2) },
  fieldLabel: { fontSize: hp(1.6), fontWeight: "400", marginBottom: hp(0.6) },
  dinHint: { fontSize: hp(1.45), marginTop: -hp(0.5), marginBottom: hp(1) },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    padding: hp(1.6),
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: hp(1),
  },
  ownerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerTitle: { fontSize: hp(1.65), fontWeight: "600" },
  ownerDesc: { fontSize: hp(1.45), lineHeight: hp(2.1), marginTop: 2 },
  modalFooter: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3.5),
    paddingHorizontal: wp(5),
  },
  modalSaveBtn: { borderRadius: 14 },
  emptyMsg: {
    fontSize: hp(1.6),
    lineHeight: hp(2.4),
    textAlign: "center",
    paddingVertical: hp(2),
  },
  editNote: { fontSize: hp(1.5), textAlign: "center", marginTop: hp(1) },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
  },
  footerBtn: { marginHorizontal: wp(4), borderRadius: 12 },
});
