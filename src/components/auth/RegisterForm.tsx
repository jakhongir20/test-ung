import type { FC } from 'react';
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../api/auth.ts";
import { useBranchesRetrieve, useGtfRetrieve, usePositionsRetrieve } from "../../api/generated/respondentWebAPI";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";
import { customInstance } from "../../api/mutator/custom-instance";

interface Props {
  className?: string;
}

type RegisterFormValues = {
  pinfl: string;
  login: string;
  password: string;
  confirmPassword: string;
  name: string;
  position_id: number;
  gtf_id: number;
  branch_id: number;
};

const defaultFormValues: RegisterFormValues = {
  pinfl: '',
  login: '',
  password: '',
  confirmPassword: '',
  name: '',
  position_id: 0,
  gtf_id: 0,
  branch_id: 0
};


export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

export const RegisterForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const register = useRegister();
  const { t, lang } = useI18n();

  // PINFL fetch state
  const [isFetchingPinfl, setIsFetchingPinfl] = useState(false);
  const [pinflError, setPinflError] = useState<string | null>(null);

  // Fetch positions, branches, and GTF from API
  // Note: APIs are exchanged - GTF uses branches API, branch uses GTF API
  const { data: positionsData, isLoading: positionsLoading, error: positionsError } = usePositionsRetrieve();
  const { data: branchesData, isLoading: branchesLoading, error: branchesError } = useBranchesRetrieve(); // This will be used for GTF
  const { data: gtfData, isLoading: gtfLoading, error: gtfError } = useGtfRetrieve(); // This will be used for branch

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    trigger,
    watch,
    setValue
  } = useForm<RegisterFormValues>({
    defaultValues: defaultFormValues,
  });

  const prevLangRef = useRef(lang);
  const password = watch('password');
  const branchId = watch('branch_id');
  const pinfl = watch('pinfl');
  const skipPositionResetRef = useRef(false);

  // Helper function to get localized name
  const getLocalizedName = (item: any) => {
    switch (lang) {
      case 'uz':
        return item.name_uz || item.name_uz_cyrl || item.name_ru || 'N/A';
      case 'uz-cyrl':
        return item.name_uz_cyrl || item.name_uz || item.name_ru || 'N/A';
      case 'ru':
        return item.name_ru || item.name_uz || item.name_uz_cyrl || 'N/A';
      default:
        return item.name_uz || item.name_uz_cyrl || item.name_ru || 'N/A';
    }
  };

  const normalizeText = (value?: string | null) =>
    (value || '')
      .replace(/["«»]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

  const getLocalizedPositionLabel = (position: any) => {
    const positionName = getLocalizedName(position);
    const branchName = position?.branch ? getLocalizedName(position.branch) : '';
    return branchName ? `${positionName} - ${branchName}` : positionName;
  };

  // Filter positions based on selected branch (include global positions with no branch)
  const filteredPositions = positionsData?.positions;
  // const filteredPositions = positionsData?.positions?.filter((position: any) => {
  //   // debugger
  //   if (!branchId || branchId === 0) return true;
  //   // debugger
  //   const posBranchId = position?.branch?.id;
  //   // debugger
  //   return posBranchId === branchId || posBranchId == null;
  // }) || [];

  // Show error if API calls failed
  if (positionsError || branchesError || gtfError) {
    // Note: branchesError is for GTF, gtfError is for branch
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-base mb-4">
          {t('error.connectionDesc')}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  // Update validation messages when language changes
  useEffect(() => {
    if (prevLangRef.current !== lang && Object.keys(errors).length > 0) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors();
      trigger();
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors]);

  // Reset position when branch changes
  useEffect(() => {
    if (skipPositionResetRef.current) {
      skipPositionResetRef.current = false;
      return;
    }
    setValue('position_id', 0);
  }, [branchId, setValue]);

  // Create reactive validation rules
  const loginValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 1,
      message: t('auth.loginMinLength')
    }
  };

  const passwordValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 1, // TODO: change to 6
      message: t('auth.passwordMinLength')
    }
  };

  const confirmPasswordValidationRules = {
    required: t('auth.fieldRequired'),
    validate: (val: string) => val === password || t('auth.passwordsDoNotMatch')
  };

  const nameValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 2,
      message: t('auth.nameMinLength')
    }
  };

  // Fetch user data by PINFL
  const handleFetchByPinfl = async () => {
    if (!pinfl || pinfl.trim().length === 0) {
      setPinflError(t('auth.pinflEmpty'));
      return;
    }

    setIsFetchingPinfl(true);
    setPinflError(null);

    try {
      // Call API to fetch employee data from 1C by PINFL
      const response = await customInstance({
        method: 'POST',
        url: `/api/1c/get-employee/`,
        data: {
          pinfl: pinfl.trim()
        }
      });

      const employeeData = response as {
        employee_id?: string;
        tin?: string;
        full_name?: string;
        pinfl?: string;
        org_code?: number;
        org_name?: string;
        work_status_date?: string;
        birth_date?: string;
        hired_at?: string;
        fired_at?: string;
        work_status?: string;
        passport_issue_date?: string;
        passport_issued_by?: string;
        passport_series?: string;
        home_address?: string;
        phone?: string;
        photo?: string;
        status?: string;
        fte?: string;
        position?: string;
        position_id?: string;
        position_class?: number;
        branch?: string;
        branch_id?: string;
        department?: string;
        department_id?: string;
        department_class?: number;
      };

      // Check if employee was found
      if (employeeData.status !== 'OK') {
        setPinflError(t('auth.pinflNotFound'));
        return;
      }

      const branches = branchesData?.branches || [];
      const normalizedBranchFromApi = normalizeText(employeeData.branch);

      const matchingBranch = branches.find((branch: any) => branch?.uuid === employeeData.branch_id) ||
        branches.find((branch: any) => {
          const potentialNames = [
            branch?.name_uz,
            branch?.name_uz_cyrl,
            branch?.name_ru,
            branch?.name
          ];
          return potentialNames.some((name) => normalizeText(name) === normalizedBranchFromApi);
        });

      const positions = positionsData?.positions || [];
      const normalizedPositionFromApi = normalizeText(employeeData.position);

      const matchingPosition = positions.find((position: any) => position?.uuid === employeeData.position_id) ||
        positions.find((position: any) => {
          const potentialNames = [
            position?.name_uz,
            position?.name_uz_cyrl,
            position?.name_ru,
            position?.name
          ];
          const matchesName = potentialNames.some((name) => normalizeText(name) === normalizedPositionFromApi);
          const branchMatches = matchingBranch
            ? (position?.branch?.id === matchingBranch.id || normalizeText(position?.branch?.name_ru) === normalizedBranchFromApi)
            : true;
          return matchesName && branchMatches;
        });

      const resolvedPinfl = ((employeeData.pinfl ?? pinfl) || '').toString().trim();
      if (resolvedPinfl) {
        setValue('pinfl', resolvedPinfl, { shouldDirty: true });
      }

      const loginValue = (employeeData.phone && employeeData.phone.trim()) ||
        (employeeData.tin && employeeData.tin.toString().trim()) ||
        '';
      if (loginValue) {
        setValue('login', loginValue, { shouldDirty: true });
      }

      const fullName = (employeeData.full_name || '').trim();
      if (fullName) {
        setValue('name', fullName, { shouldDirty: true });
      }

      if (matchingBranch) {
        skipPositionResetRef.current = true;
        setValue('branch_id', matchingBranch.id, { shouldDirty: true });
      }

      if (matchingPosition) {
        setValue('position_id', matchingPosition.id, { shouldDirty: true });
      }

      console.log('✅ Employee data fetched from 1C by PINFL:', employeeData);
    } catch (error) {
      console.log('❌ Failed to fetch employee by PINFL:', error);
      setPinflError(t('auth.pinflNotFound'));
    } finally {
      setIsFetchingPinfl(false);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register.mutateAsync({
        phone: values.login,
        password: values.password,
        name: values.name,
        position_id: values.position_id,
        gtf_id: values.gtf_id
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle registration errors

      // Show server error message
      if (error?.response?.data?.non_field_errors) {
        alert(error.response.data.non_field_errors[0]);
      } else if (error?.response?.data?.detail) {
        alert(error.response.data.detail);
      } else if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error?.response?.data?.phone_number) {
        alert(error.response.data.phone_number[0]);
      } else {
        alert(t('auth.registerError'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      {/* PINFL Field - Optional */}
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">
          PINFL
          {/* <span className="text-gray-500 text-sm font-normal">({t('auth.optional')})</span> */}
        </label>
        <div className="flex gap-2">
          <Controller
            name="pinfl"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="PINFL"
                className={authInputStyle + ' flex-1'}
                maxLength={14}
              />
            )}
          />
          <button
            type="button"
            onClick={handleFetchByPinfl}
            disabled={isFetchingPinfl || !pinfl || pinfl.trim().length === 0}
            className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isFetchingPinfl ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t('auth.fetch')
            )}
          </button>
        </div>
        {pinflError && <p className="text-red-600 text-base mt-1">{pinflError}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.login')}</label>
        <Controller
          name="login"
          control={control}
          rules={loginValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('auth.loginPlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.login && <p className="text-red-600 text-base mt-1">{errors.login.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.fullName')}</label>
        <Controller
          name="name"
          control={control}
          rules={nameValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.name && <p className="text-red-600 text-base mt-1">{errors.name.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.password')}</label>
        <Controller
          name="password"
          control={control}
          rules={passwordValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.password && <p className="text-red-600 text-base mt-1">{errors.password.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.confirmPassword')}</label>
        <Controller
          name="confirmPassword"
          control={control}
          rules={confirmPasswordValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="password"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.confirmPassword && <p className="text-red-600 text-base mt-1">{errors.confirmPassword.message}</p>}
      </div>

      {/* 1. GTF Field - uses GTF API */}
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.gtf')}</label>
        <Controller
          name="branch_id"
          control={control}
          rules={{ required: t('auth.fieldRequired'), validate: (v: number) => v !== 0 || t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={gtfLoading}>
              <option value={0}>{t('auth.selectBranch')}</option>
              {gtfData?.gtf?.map((gtf) => (
                <option key={gtf.id} value={gtf.id}>
                  {getLocalizedName(gtf)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.branch_id && <p className="text-red-600 text-base mt-1">{errors.branch_id.message}</p>}

      </div>

      {/* 2. Department (Branch) Field - uses branches API  */}
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.branch')}</label>
        <Controller
          name="gtf_id"
          control={control}
          rules={{ required: t('auth.fieldRequired'), validate: (v: number) => v !== 0 || t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={branchesLoading}>
              <option value={0}>{t('auth.selectGtf')}</option>
              {branchesData?.branches?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {getLocalizedName(branch)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.gtf_id && <p className="text-red-600 text-base mt-1">{errors.gtf_id.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.position')}</label>
        <Controller
          name="position_id"
          control={control}
          rules={{ required: t('auth.fieldRequired'), validate: (v: number) => v !== 0 || t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={positionsLoading}>
              <option value={0}>{t('auth.selectPosition')}</option>
              {filteredPositions?.map((position) => (
                <option key={position.id} value={position.id}>
                  {getLocalizedPositionLabel(position)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.position_id && <p className="text-red-600 text-base mt-1">{errors.position_id.message}</p>}
      </div>

      <FormButton isLoading={isSubmitting || positionsLoading || branchesLoading || gtfLoading} title={t('auth.register')} />

      <div className="text-center mt-4">
        <p className="text-gray-600 text-base">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-cyan-700 hover:underline font-medium">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </form>
  );
};
