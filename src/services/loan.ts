import { LOSInstance } from ".";
import { Alert } from "react-native";

export const getPurposeOfLoanLovOptions = async () => {
  try {
    const response = await LOSInstance.get("/loans/loan-purpose");
    return response.data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const calculateEMIService = async ({
  product,
  amount,
  tenor,
  intRate,
  memberId,
  loanType,
  branch,
  moratorium,
}: {
  product: string;
  amount: string;
  tenor: string;
  intRate: string;
  memberId: string;
  loanType: string;
  branch: string;
  moratorium: string;
}) => {
  try {
    if (!product) {
      Alert.alert("Please select a product");
    } else if (!amount) {
      Alert.alert("Please enter the loan amount");
    } else if (!tenor) {
      Alert.alert("Please enter the tenure");
    } else if (!intRate) {
      Alert.alert("Please enter the interest rate");
    } else {
      const [response1, response2] = await Promise.all([
        LOSInstance.get(
          `/loans/flexcube/account/calculate-emi?amount=${amount}&tenor=${tenor}&intRate=${intRate}&product=${product}&branch=${branch}&moratorium=${moratorium}`
        ),
        LOSInstance.get(
          `/loans/flexcube/account/amort-sheet?amount=${amount}&tenor=${tenor}&intRate=${intRate}&product=${product}&memberId=${memberId}&loanType=${loanType}&branch=${branch}&moratorium=${moratorium}`
        ),
      ]);

      return { data1: response1.data, data2: response2.data };
    }
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const getSharesAndFixedDepositData = async (cifId: string) => {
  try {
    const [response1, response2] = await Promise.all([
      LOSInstance.get(
        "/loans/flexcube/account?accountType=Share&memberId=" + cifId
      ),
      LOSInstance.get(
        "/loans/flexcube/account?accountType=Fixed Deposits&memberId=" + cifId
      ),
    ]);

    return { data1: response1.data, data2: response2.data };
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const handleCreateUpdateLoanApplication = async (
  body: any,
  endpoint: string,
  step: number
) => {
  try {
    if (step == 0) {
      const { data } = await LOSInstance.post(endpoint, body);
      return data;
    } else {
      const { data } = await LOSInstance.put(endpoint, body);
      return data;
    }
  } catch (error) {
    throw error;
  }
};

export const handleSoapCall = async (loanId: string) => {
  try {
    const { data } = await LOSInstance.post(
      `/loans/secured-loans/soap-api?loanId=${loanId}`,
      {}
    );

    if (data.data.error) {
      throw Error("Failed Soap");
    } else {
      return data;
    }
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const getBranchOptions = async () => {
  try {
    const { data } = await LOSInstance.get(
      "/loans/fetch-dropdowns-data?type=branch"
    );

    return data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const getUnsecuredLoanPdfs = async (loanId: string) => {
  try {
    const { data } = await LOSInstance.get(`/loans/unsecured-loans/${loanId}`);

    return data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const getLOCLoanPdfs = async (loanId: string) => {
  try {
    const { data } = await LOSInstance.get(`/loans/loc-loan/${loanId}`);

    return data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const getLoanOfficers = async (branchCode: string) => {
  try {
    const { data } = await LOSInstance.get(
      `/loans/loan-officer?branchCode=${branchCode}`
    );

    return data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};
