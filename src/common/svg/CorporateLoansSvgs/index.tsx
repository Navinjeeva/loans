import React from "react";
import Svg, {Path, Circle as SvgCircle, Rect, Circle} from "react-native-svg";


// ================ src/common/componnets/ScreenHeader/index.tsx ( Tick mark) ==================================
export const CheckIcon = ({
  size = 13,
  color = "#2A2E37",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


// ================  src/corporateLoans/ClassificationScreen  Svgs ==================================
export const EditIcon = ({ size = 16, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 20h9" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);



// ================  src/common/DropDownModal/index.tsx  Svgs ==================================
export const ChevronDown = ({ size = 18, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const SearchIcon = ({ size = 17, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <SvgCircle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.75} />
    <Path d="M21 21l-4.3-4.3" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);
export const CloseIcon = ({ size = 18, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
export const CheckIconModal = ({ size = 13, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);




// ================  src/common/EntityEditor/index.tsx  Svgs ==================================

export const Sx = ({
  size = 18,
  color,
  stroke = 1.75,
  children,
}: {
  size?: number;
  color?: string;
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
// const CloseIcon = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M18 6L6 18M6 6l12 12" />
//   </Sx>
// );
// const CheckIcon = (p: any) => (
//   <Sx {...p} stroke={3}>
//     <Path d="M20 6L9 17l-5-5" />
//   </Sx>
// );
export const AlertIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M12 3l9 16H3z" />
    <Path d="M12 10v4M12 17h.01" />
  </Sx>
);
// const ChevronDown = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M6 9l6 6 6-6" />
//   </Sx>
// );
export const PercentIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M19 5L5 19" />
    <Circle cx={7.5} cy={7.5} r={2.5} />
    <Circle cx={16.5} cy={16.5} r={2.5} />
  </Sx>
);
export const UserIcon = (p: any) => (
  <Sx {...p}>
    <Circle cx={12} cy={8} r={3.5} />
    <Path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
  </Sx>
);
export const CalendarIcon = (p: any) => (
  <Sx {...p}>
    <Rect x={3} y={5} width={18} height={16} rx={2} />
    <Path d="M3 9h18M8 3v4M16 3v4" />
  </Sx>
);


// ================  src/common/BankCard/index.tsx  Svgs ==================================
// ── SVG icons (inline) — color passed via theme at the call site ──
// export const Sx = ({
//   size = 18,
//   color,
//   stroke = 1.75,
//   children,
// }: {
//   size?: number;
//   color?: string;
//   stroke?: number;
//   children: React.ReactNode;
// }) => (
//   <Svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke={color}
//     strokeWidth={stroke}
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     {children}
//   </Svg>
// );
export const BankIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M3 10l9-6 9 6" />
    <Path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
    <Path d="M3 21h18" />
  </Sx>
);
export const EditIcon2 = (p: any) => (
  <Sx {...p}>
    <Path d="M12 20h9" />
    <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </Sx>
);
export const TrashIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
    <Path d="M10 11v6M14 11v6" />
  </Sx>
);

// ================  src/common/DocumentActionsModal/index.tsx  Svgs ==================================
export const EyeIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <SvgCircle cx={12} cy={12} r={3} />
  </Sx>
);
export const DownloadIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M12 4v12M7 11l5 5 5-5" />
    <Path d="M5 20h14" />
  </Sx>
);

// ================  src/common/DocumentPreviewModal/index.tsx  Svgs ==================================
export const DocCheckIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <Path d="M14 3v5h5" />
    <Path d="M9 15l1.8 1.8L14 13" />
  </Sx>
);
export const ArrowRightIcon = (p: any) => (
  <Sx {...p} stroke={2.2}>
    <Path d="M5 12h14M13 6l6 6-6 6" />
  </Sx>
);



// ================  src/common/Disbursement/index.tsx  Svgs ==================================


// const Sx = ({
//   size = 18,
//   color,
//   stroke = 1.75,
//   children,
// }: {
//   size?: number;
//   color?: string;
//   stroke?: number;
//   children: React.ReactNode;
// }) => (
//   <Svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke={color}
//     strokeWidth={stroke}
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     {children}
//   </Svg>
// );
// const BankIcon = (p: any) => (
//   <Sx {...p}>
//     <Path d="M3 10l9-6 9 6" />
//     <Path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
//     <Path d="M3 21h18" />
//   </Sx>
// );
export const WalletIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
    <Rect x={3} y={7} width={18} height={13} rx={2} />
    <Path d="M16 13h2" />
  </Sx>
);
export const PlusIcon = (p: any) => (
  <Sx {...p} stroke={2}>
    <Path d="M12 5v14M5 12h14" />
  </Sx>
);
// const ChevronDown = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M6 9l6 6 6-6" />
//   </Sx>
// );
// const CloseIcon = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M18 6L6 18M6 6l12 12" />
//   </Sx>
// );
// const CheckIcon = (p: any) => (
//   <Sx {...p} stroke={3}>
//     <Path d="M20 6L9 17l-5-5" />
//   </Sx>
// );
export const InfoIcon = (p: any) => (
  <Sx {...p}>
    <SvgCircle cx={12} cy={12} r={9} />
    <Path d="M12 11v5M12 8h.01" />
  </Sx>
);
export const UploadIcon = (p: any) => (
  <Sx {...p} stroke={2}>
    <Path d="M12 16V5M8 9l4-4 4 4" />
    <Path d="M5 19h14" />
  </Sx>
);



// ================  src/common/Collateral/index.tsx  Svgs ==================================


export const ShieldIcon = (p: any) => (
  <Sx {...p}>
    <Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    <Path d="M9 12l2 2 4-4" />
  </Sx>
);
// export const PlusIcon = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M12 5v14M5 12h14" />
//   </Sx>
// );
// const EditIcon = (p: any) => (
//   <Sx {...p}>
//     <Path d="M12 20h9" />
//     <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
//   </Sx>
// );
// const TrashIcon = (p: any) => (
//   <Sx {...p}>
//     <Path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
//     <Path d="M10 11v6M14 11v6" />
//   </Sx>
// );


// ================  src/common/EMICalculater /index.tsx  Svgs ==================================


export const ChevronDownEMI = ({
  size = 15,
  color,
  up = false,
}: {
  size?: number;
  color: string;
  up?: boolean;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: up ? "180deg" : "0deg" }] }}
  >
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const ChevronRightEMI = ({
  size = 15,
  color,
}: {
  size?: number;
  color: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export const RefreshIcon = ({
  size = 13,
  color,
}: {
  size?: number;
  color: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12a8 8 0 0 1 13.5-5.8L20 8M20 4v4h-4"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 12a8 8 0 0 1-13.5 5.8L4 16M4 20v-4h4"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ================  src/common/BottomUploadModal /index.tsx  Svgs ==================================
const BUMSx = ({ size = 22, color, stroke = 1.85, children } : any & { children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);
export const CameraIcon = (p: any) => (
  <BUMSx {...p}>
    <Path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <Circle cx={12} cy={13} r={3.5} />
  </BUMSx>
);
export const ImageIcon = (p: any) => (
  <BUMSx {...p}>
    <Rect x={3} y={4} width={18} height={16} rx={2} />
    <Circle cx={9} cy={10} r={2} />
    <Path d="M21 17l-5-5-9 9" />
  </BUMSx>
);
export const FileIcon = (p: any) => (
  <BUMSx {...p}>
    <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <Path d="M14 3v5h5" />
    <Path d="M9 13h6M9 16h4" />
  </BUMSx>
);
export const ChevronRight = (p: any) => (
  <BUMSx {...p} stroke={2}>
    <Path d="M9 18l6-6-6-6" />
  </BUMSx>
);
// const CloseIcon = (p: any) => (
//   <BUMSx {...p} stroke={2}>
//     <Path d="M18 6L6 18M6 6l12 12" />
//   </BUMSx>
// );
export const InfoIconBottom = (p: any) => (
  <BUMSx {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 8h.01M11 12h1v4h1" />
  </BUMSx>
);
export const LockIcon = (p: any) => (
  <BUMSx {...p}>
    <Rect x={5} y={11} width={14} height={9} rx={2} />
    <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </BUMSx>
);





export const ChevronDownPersonKYC = ({ open, color }: { open: boolean; color: string }) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
  >
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);