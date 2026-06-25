import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import {
  TextInputComponent,
  DateInput,
  CurrencyInput,
} from "@src/common";
import MobileNumberInputComponent from "@src/common/components/MobileNumberComponent";
import { useDispatch, useSelector } from "react-redux";
import {
  setCompany,
  setRegOffice,
  setOpOffice,
  setFinancial,
  setDirectors,
  addOwner,
  removeOwner,
  addObligation,
  updateObligation,
  removeObligation,
} from "@src/store/corporate";
import ScreenHeader from "@src/common/components/ScreenHeader";
import BottomButton from "@src/common/components/BottomButton";
import DropDownModal from "@src/common/components/DropDownModal";
import ExpandableSection from "@src/common/components/ExpandableSection";
import EntityEditor, { FieldConfig } from "@src/common/components/EntityEditor";
import BankCard from "@src/common/components/BankCard";
import type { RootState } from "@src/store";

const DIRECTOR_FIELDS: FieldConfig[] = [
  { key: "name", label: "Full name", required: true, placeholder: "Director name" },
  { key: "designation", label: "Designation", type: "select", required: true, placeholder: "Select designation", options: DESIGNATIONS_LATE() },
  { key: "mobile", label: "Mobile number", required: true, type: "phone", defaultCode: "+91" },
  { key: "email", label: "Email address", required: true, placeholder: "name@company.com" },
  { key: "din", label: "DIN", required: true, placeholder: "02145673", numeric: true, maxLength: 8, helper: "Director Identification Number" },
  { key: "isOwner", label: "Is this person an owner?", type: "toggle", helper: "Holds shares / profit-share in the company" },
  { key: "ownership", label: "Ownership %", type: "percent", required: true, when: (v) => !!v.isOwner },
];

const PARTNER_FIELDS: FieldConfig[] = [
  { key: "name", label: "Owner / shareholder name", required: true, placeholder: "Individual or entity name" },
  { key: "ownerType", label: "Owner type", type: "select", required: true, placeholder: "Select type", options: [
    { value: "Individual", label: "Individual" },
    { value: "Corporate Body", label: "Corporate Body" },
    { value: "Holding Company", label: "Holding Company" },
    { value: "Trust", label: "Trust" },
  ] },
  { key: "shareholding", label: "Shareholding %", type: "percent", required: true },
];

const OBLIGATION_FIELDS: FieldConfig[] = [
  { key: "lender", label: "Lender", required: true, placeholder: "Bank / NBFC name" },
  { key: "facilityType", label: "Facility type", type: "select", required: true, placeholder: "Select facility", options: [
    { value: "Term Loan", label: "Term Loan" },
    { value: "Cash Credit", label: "Cash Credit" },
    { value: "Overdraft", label: "Overdraft" },
    { value: "Other", label: "Other" },
  ] },
  { key: "sanctioned", label: "Sanctioned amount", type: "amount", required: true, currency: "₹" },
  { key: "outstanding", label: "Current outstanding", type: "amount", required: true, currency: "₹" },
  { key: "emi", label: "Monthly EMI", type: "amount", currency: "₹" },
  { key: "endDate", label: "End date", type: "date" },
];

function DESIGNATIONS_LATE() {
  return [
    { value: "Managing Director", label: "Managing Director" },
    { value: "Whole-time Director", label: "Whole-time Director" },
    { value: "Director", label: "Director" },
    { value: "Non-Executive Director", label: "Non-Executive Director" },
    { value: "Independent Director", label: "Independent Director" },
    { value: "Chief Executive Officer", label: "Chief Executive Officer" },
    { value: "Chief Financial Officer", label: "Chief Financial Officer" },
    { value: "Company Secretary", label: "Company Secretary" },
  ];
}


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

  const {
    company: c,
    financial: f,
    office,
    directors,
    owners,
    obligations,
    onboardMode,
  } = useSelector((state: RootState) => state.corporate);

  // Reference / dropdown data — comes from API later, sample data for now
  const BUSINESS_TYPES = useSelector((s: RootState) => s.catalogs.businessTypes);
  const INDUSTRIES = useSelector((s: RootState) => s.catalogs.industries);
  const COUNTRIES = useSelector((s: RootState) => s.catalogs.countries);
  const INDIAN_STATES = useSelector((s: RootState) => s.catalogs.states);
  const DESIGNATIONS = useSelector((s: RootState) => s.catalogs.designations);
  const isAI = onboardMode === "ai";

  const set = (k: string, v: any) => dispatch(setCompany({ [k]: v }));
  const setFin = (k: string, v: any) => dispatch(setFinancial({ [k]: v }));
  const setOff = (sec: string, k: string, v: any) =>
    sec === "reg" ? dispatch(setRegOffice({ [k]: v })) : dispatch(setOpOffice({ [k]: v }));

  // Director modal state
  const [dirModal, setDirModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirForm, setDirForm] = useState<any>({ ...EMPTY_DIR });

  // Partner / owner modal UI state (data lives in redux)
  const [partnerModal, setPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState<any>({});

  // Obligation modal UI state (data lives in redux)
  const [obligationModal, setObligationModal] = useState(false);
  const [obligationForm, setObligationForm] = useState<any>({});
  const [editingObligationId, setEditingObligationId] = useState<string | null>(null);

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

  const saveDir = (values: any) => {
    if (!values.name || !values.designation) return;
    if (editingId) {
      dispatch(setDirectors(directors.map((d: any) => d.id === editingId ? { ...d, ...values } : d)));
    } else {
      const newId = String(Date.now());
      dispatch(setDirectors([...directors, { id: newId, ...values }]));
    }
    setDirModal(false);
  };

  const openAddPartner = () => {
    setPartnerForm({});
    setPartnerModal(true);
  };
  const savePartner = (values: any) => {
    dispatch(addOwner({ id: String(Date.now()), ...values }));
    setPartnerModal(false);
  };
  const deleteOwner = (id: string) => dispatch(removeOwner(id));

  const openAddObligation = () => {
    setEditingObligationId(null);
    setObligationForm({});
    setObligationModal(true);
  };
  const openEditObligation = (o: any) => {
    setEditingObligationId(o.id);
    setObligationForm({
      lender: o.lender,
      facilityType: o.facilityType,
      sanctioned: o.sanctioned,
      outstanding: o.outstanding,
      emi: o.emi,
      endDate: o.endDate,
    });
    setObligationModal(true);
  };
  const saveObligation = (values: any) => {
    if (editingObligationId) {
      dispatch(updateObligation({ id: editingObligationId, patch: values }));
    } else {
      dispatch(addObligation({ id: String(Date.now()), ...values }));
    }
    setObligationModal(false);
  };
  const deleteObligation = (id: string) => dispatch(removeObligation(id));

  // Total monthly obligations (sum of all EMIs)
  const totalEmi = obligations.reduce(
    (sum, o) => sum + (Number(o.emi) || 0),
    0,
  );

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
      
      <ScreenHeader
        step={2}
        showSteps={true}
        title={isAI ? "Verify company info" : "Company information"}
        onPress={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        totalSteps={6}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {isAI && (
          <View style={[styles.autoFillBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.bannerIcon, { backgroundColor: colors.brandTint }]}>
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
          title="Company classification"
          summary={[c.country, c.businessType, c.industry].filter(Boolean).join(" · ")}
          defaultOpen={!isAI}
        >
          <DropDownModal
            selected={c.country}
            onChange={(v: string) => set("country", v)}
            header="Country of registration"
            data={COUNTRIES}
            placeholder="Select country"
            isSearchable={true}
            searchPlaceholder="Search"
            label="Country of registration"
            required
            style={{ marginBottom: 18 }}
          />

          <DropDownModal
            selected={c.otherCountry}
            onChange={(v: string) => set("otherCountry", v)}
            header="Other country registration"
            data={COUNTRIES}
            placeholder="Select country"
            isSearchable={true}
            searchPlaceholder="Search"
            label="Other country registration"
            style={{ marginBottom: 18 }}
          />

          <DropDownModal
            header="Business Type"
            selected={c.businessType}
            onChange={(v: string) => set("businessType", v)}
            data={BUSINESS_TYPES}
            placeholder="Select business type"
            label="Business type"
            required
            style={{ marginBottom: 18 }}
          />

          <DropDownModal
            header="Industry"
            selected={c.industry}
            onChange={(v: string) => set("industry", v)}
            data={INDUSTRIES}
            placeholder="Select industry"
            label="Industry type"
            required
            style={{ marginBottom: 18 }}
          />

        </ExpandableSection>


        {/* 2 · Company identity */}
        <ExpandableSection
          title="Company identity"
          summary={c.name || "Tap to add"}
          defaultOpen={!isAI}
        >
          <TextInputComponent
            header="Registered company name "
            placeholder="Company Pvt Ltd"
            value={c.name}
            onChange={(v: string) => set("name", v)}
            required
            customStyles={{marginVertical : 8}}
          />

          <TextInputComponent
            header="Corporate Identification Number (CIN)"
            placeholder="U29299MH2009PTC000000"
            value={c.cin}
            onChange={(v: string) => set("cin", v.toUpperCase().slice(0, 21))}
            required
            caps
            maxLength={21}
            customStyles={{marginVertical : 10}}
          />

          <TextInputComponent
            header="Permanent Account Number (PAN) "
            placeholder="AAFCM1234Q"
            value={c.pan}
            onChange={(v: string) =>
              set("pan", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))
            }
            required
            caps
            maxLength={10}
            customStyles={{marginVertical : 12}}
          />

          <TextInputComponent
            header="GST registration number "
            placeholder="27AAFCM1234Q1Z5"
            value={c.gst}
            onChange={(v: string) =>
              set("gst", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))
            }
            caps
            maxLength={15}
            customStyles={{marginVertical : 10}}
          />

          <TextInputComponent
            header="Udyam Registration "
            placeholder="UDYAM-KA-03-0012345"
            value={c.udyam}
            onChange={(v: string) =>
              set("udyam", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))
            }
            caps
            maxLength={15}
            customStyles={{marginVertical : 10}}
          />

          <View style={{marginVertical : 8}}>
            <DateInput
            label="Date of incorporation"
            date={c.doi}
            onDateChange={(v: string) => set("doi", v)}
            required
            placeholder="YYYY-MM-DD"
            customStyles={{marginVertical : 8}}
          />
          </View>
        </ExpandableSection>


        {/* 3 · Registered office */}
        <ExpandableSection
          title="Registered office"
          summary={ office.reg.city ? `${office.reg.city}, ${office.reg.state}` : "Tap to add"}
        >
          <DropDownModal
            selected={office.reg.country}
            onChange={(v: string) => setOff("reg", "country", v)}
            header="Country"
            data={COUNTRIES}
            placeholder="Select country"
            isSearchable={true}
            searchPlaceholder="Search ..."
            label="Country"
            required
            style={{ marginBottom: 18 }}
          />

          <DropDownModal
            header="State"
            selected={office.reg.state}
            onChange={(v: string) => setOff("reg", "state", v)}
            data={INDIAN_STATES}
            placeholder="Select State"
            isSearchable={true}
            searchPlaceholder="Search ..."
            label="State"
            required
            style={{ marginBottom: 12 }}
          />

          <TextInputComponent
            header="City "
            placeholder="City"
            value={office.reg.city}
            onChange={(v: string) => setOff("reg", "city", v)}
            required
            customStyles={{marginVertical : 8}}
          />

          <TextInputComponent
            header="Area / locality  "
            placeholder="Area / locality"
            value={office.reg.locality}
            onChange={(v: string) => setOff("reg", "locality", v)}
            required
            customStyles={{marginVertical : 10}}
          />

          <TextInputComponent
            header="Building / office address"
            placeholder="Plot / Building / Street"
            value={office.reg.address}
            onChange={(v: string) => setOff("reg", "address", v)}
            required
            multiline
            numberOfLines={2}
            customStyles={{marginVertical : 10}}
          />

          <TextInputComponent
            header="PIN code "
            placeholder="400001"
            value={office.reg.postal}
            onChange={(v: string) =>
              setOff("reg", "postal", v.replace(/[^0-9]/g, "").slice(0, 6))
            }
            required
            keyboardType="numeric"
            maxLength={6}
            customStyles={{marginVertical : 10}}
          />
        </ExpandableSection>

        {/* 4 · Operational office */}
        <ExpandableSection
          title="Operational office"
          summary={ office.op.city ? `${office.op.city}, ${office.op.state}` : "Tap to add"}
        >
          <DropDownModal
            header="Country"
            selected={office.op.country}
            onChange={(v: string) => setOff("op", "country", v)}
            data={COUNTRIES}
            placeholder="Select country"
            isSearchable={true}
            searchPlaceholder="Search ..."
            label="Country"
            required
            style={{ marginBottom: 18 }}
          />

          <DropDownModal
            header="State"
            selected={office.op.state}
            onChange={(v: string) => setOff("op", "state", v)}
            data={INDIAN_STATES}
            placeholder="Select State"
            isSearchable={true}
            searchPlaceholder="Search ..."
            label="State"
            required
            style={{ marginBottom: 12 }}
          />

          <TextInputComponent
            header="City "
            placeholder="City"
            value={office.op.city}
            onChange={(v: string) => setOff("op", "city", v)}
            required
            customStyles={{marginVertical : 8}}
          />

          <TextInputComponent
            header="Area / locality   "
            placeholder="Area / locality"
            value={office.op.locality}
            onChange={(v: string) => setOff("op", "locality", v)}
            required
            customStyles={{marginVertical : 10}}
          />

          <TextInputComponent
            header="Building / office address"
            placeholder="Plot / Building / Street"
            value={office.op.address}
            onChange={(v: string) => setOff("op", "address", v)}
            required
            multiline
            numberOfLines={2}
            customStyles={{marginVertical : 10}}
          />

          <TextInputComponent
            header="PIN code "
            placeholder="400001"
            value={office.op.postal}
            onChange={(v: string) =>
              setOff("op", "postal", v.replace(/[^0-9]/g, "").slice(0, 6))
            }
            required
            keyboardType="numeric"
            maxLength={6}
            customStyles={{marginVertical : 10}}
          />
        </ExpandableSection>


        {/* 5 · Directors */}
        <ExpandableSection
          title="Directors & owners"
          summary={ directors.length > 0 ? `${directors.length} director${directors.length > 1 ? "s" : ""} · ${totalOwnership}% shareholding` : "Tap to add"}
        >
          {/* ── DIRECTORS ── */}
          <Text style={[styles.dirGroupLabel, { color: colors.textMuted }]}>DIRECTORS</Text>

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
                style={[styles.dirActionBtn, { backgroundColor: colors.dangerTint, borderColor: colors.dangerBorder }]}
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

          {/*  OWNERS / SHAREHOLDERS  */}
          <Text style={[styles.dirGroupLabel, { color: colors.textMuted, marginTop: 18 }]}>OWNERS / SHAREHOLDERS</Text>
          {owners.map((o: any) => (
            <View
              key={o.id}
              style={[styles.dirCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.dirAvatar, { backgroundColor: getAvatarColor(o.id) }]}>
                <Text style={styles.dirAvatarText}>{getInitials(o.name)}</Text>
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.dirName, { color: colors.text }]} numberOfLines={1}>{o.name}</Text>
                <Text style={[styles.dirRole, { color: colors.textSecondary }]}>{o.ownerType}</Text>
              </View>

              <TouchableOpacity
                style={[styles.dirActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteOwner(o.id)}
                style={[styles.dirActionBtn, { backgroundColor: colors.dangerTint, borderColor: colors.dangerBorder }]}
              >
                <Text style={{ fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>

            </View>
          ))}
          
          <TouchableOpacity
            onPress={openAddPartner}
            style={[styles.addDirBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.addDirBtnText, { color: colors.text }]}>+ Add Partner</Text>
          </TouchableOpacity>
        </ExpandableSection>

        <EntityEditor
          visible={partnerModal}
          onClose={() => setPartnerModal(false)}
          title="Add partner / owner"
          subtitle="Shareholding details"
          fields={PARTNER_FIELDS}
          initial={partnerForm}
          onSave={savePartner}
        />

        <EntityEditor
          visible={obligationModal}
          onClose={() => setObligationModal(false)}
          title={editingObligationId ? "Edit obligation" : "Add obligation"}
          subtitle="Existing borrowing details"
          fields={OBLIGATION_FIELDS}
          initial={obligationForm}
          onSave={saveObligation}
        />

        <EntityEditor
          visible={dirModal}
          onClose={() => setDirModal(false)}
          title={editingId ? "Edit director" : "Add director"}
          subtitle={`Director details · ${c.country || "India"} (${(c.country || "India").slice(0, 2).toUpperCase()})`}
          fields={DIRECTOR_FIELDS}
          initial={dirForm}
          onSave={saveDir}
        />

        {/* 6 · Financial information */}
        <ExpandableSection
          title="Financial information"
          summary={f.annualRevenue ? `Revenue ₹${(+f.annualRevenue / 10000000).toFixed(1)} Cr` : "Tap to add"}
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

        {/* 7.  Existing obligations (own ExpandableSection)  */}
        <ExpandableSection
          title="Existing obligations"
          summary={ obligations.length > 0 ? `${obligations.length} facilit${obligations.length === 1 ? "y" : "ies"}`
            : "No existing borrowings"
          }
        >
          <Text style={[styles.obligDesc, { color: colors.muted }]}>
            Current borrowings — pre-filled from your credit-bureau report. Add or
            correct any facility.
          </Text>

          {obligations.map((ob: any) => (
            <View key={ob.id} style={{ marginBottom: 10 }}>
              <BankCard
                lender={ob.lender}
                facilityType={ob.facilityType}
                endDate={ob.endDate}
                sanctioned={ob.sanctioned}
                outstanding={ob.outstanding}
                emi={ob.emi}
                onEdit={() => openEditObligation(ob)}
                onDelete={() => deleteObligation(ob.id)}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={openAddObligation}
            style={[styles.addDirBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.addDirBtnText, { color: colors.text }]}>
              + Add Obligation
            </Text>
          </TouchableOpacity>

          {obligations.length > 0 && (
            <View style={[styles.totalRow, { backgroundColor: colors.buttonDisabledBackground }]}>
              <Text style={[styles.totalLabel, { color: colors.muted }]}>Total monthly obligations</Text>
              <Text style={[styles.totalValue, { color: colors.ink }]}>
                ₹{totalEmi.toLocaleString("en-IN")}.00
              </Text>
            </View>
          )}
        </ExpandableSection>

      
        <Text style={[styles.editNote, { color: colors.textMuted }]}>
          🔒 You can edit everything before submission
        </Text>

      </ScrollView>

      <BottomButton
        text="Confirm & Continue"
        onPress={() => navigation.navigate("CorporateLoan")}
        disabled={!companyComplete}
      />
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

  // ── Existing obligations section ──
  // (color values are applied inline in JSX via colors.muted / colors.buttonDisabledBackground / colors.ink)
  obligDesc: {
    fontSize: 11.5,
    lineHeight: 17,
    marginBottom: 11,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});
