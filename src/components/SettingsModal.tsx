import type { FC } from 'react';
import React, { useRef } from 'react';
import { Controller, useForm } from "react-hook-form";
import { useI18n } from "../i18n";
import { logout, useUpdateUserProfile } from "../api/auth";
import { useUsersMeRetrieve } from "../api/generated/respondentWebAPI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsFormValues = {
  name: string;
  branch: string;
  position: string;
  employee_level: 'junior' | 'engineer';
  work_domain: 'natural_gas' | 'lpg_gas';
};

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t, lang } = useI18n();
  const { data: user } = useUsersMeRetrieve();
  const updateProfile = useUpdateUserProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
    trigger
  } = useForm<SettingsFormValues>({
    defaultValues: {
      name: user?.name || '',
      branch: user?.branch || '',
      position: user?.position || '',
      employee_level: ((user as any)?.employee_level as 'junior' | 'engineer') || 'junior',
      work_domain: ((user as any)?.work_domain as 'natural_gas' | 'lpg_gas') || 'natural_gas'
    },
  });

  const prevLangRef = useRef(lang);

  // Reset form when user data changes
  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        branch: user.branch || '',
        position: user.position || '',
        employee_level: ((user as any).employee_level as 'junior' | 'engineer') || 'junior',
        work_domain: ((user as any).work_domain as 'natural_gas' | 'lpg_gas') || 'natural_gas'
      });
    }
  }, [user, reset]);

  // Update validation messages when language changes
  React.useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (prevLangRef.current !== lang && hasErrors) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors();
      trigger();
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      clearErrors();

      await updateProfile.mutateAsync({
        name: data.name.trim(),
        branch: data.branch.trim(),
        position: data.position.trim(),
        employee_level: data.employee_level,
        work_domain: data.work_domain
      });

      // Show success message (you could add a toast notification here)
      console.log(t('settings.saveSuccess'));

      // Close modal on success
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // Handle API errors
      if (error?.response?.data?.name) {
        setError('name', {
          type: 'manual',
          message: error.response.data.name[0] || t('settings.fullNameRequired')
        });
      }
      if (error?.response?.data?.branch) {
        setError('branch', {
          type: 'manual',
          message: error.response.data.branch[0] || t('settings.branchRequired')
        });
      }
      if (error?.response?.data?.position) {
        setError('position', {
          type: 'manual',
          message: error.response.data.position[0] || t('settings.positionRequired')
        });
      }
      if (error?.response?.data?.employee_level) {
        setError('employee_level', {
          type: 'manual',
          message: error.response.data.employee_level[0] || t('settings.employeeLevelRequired')
        });
      }
      if (error?.response?.data?.work_domain) {
        setError('work_domain', {
          type: 'manual',
          message: error.response.data.work_domain[0] || t('settings.workDomainRequired')
        });
      }

      // General error if no specific field errors
      if (!error?.response?.data?.name && !error?.response?.data?.branch && !error?.response?.data?.position && !error?.response?.data?.employee_level && !error?.response?.data?.work_domain) {
        setError('root', {
          type: 'manual',
          message: t('settings.saveError')
        });
      }
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-full top-0 bottom-0 left-0 right-0 z-20 ">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div
        className="absolute right-4 top-4 bottom-4 w-[min(450px,95vw)] overflow-hidden rounded-xl md:rounded-[16px] bg-white ring-1 ring-gray-200 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-6">
            <h4 className="text-xl font-semibold">{t('settings.title')}</h4>
            <button
              onClick={onClose}
              className="inline-flex h-6 w-6 items-center justify-center rounded ring-1 ring-gray-200 hover:bg-gray-50"
              aria-label={t('close')}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              {/* Full Name Field */}
              <div>
                <div className="text-base text-gray-500 mb-2">{t('settings.fullName')}</div>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('settings.fullNameRequired') }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      disabled
                      placeholder={t('settings.fullNamePlaceholder')}
                      className={`w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Branch Field */}
              <div>
                <div className="text-base text-gray-500 mb-2">{t('settings.branch')}</div>
                <Controller
                  name="branch"
                  control={control}
                  rules={{ required: t('settings.branchRequired') }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="director_executive_apparatus">Direktor (Ijro apparati)</option>
                      <option value="deputy_director_chief_engineer">Direktorning birinchi o'rinbosari - bosh muhandis (Ijro apparati)</option>
                      <option value="deputy_director_natural_lpg_gas">Tabiiy va suyultirilgan gazni sotish bo'yicha direktorning o'rinbosari (Ijro apparati)</option>
                      <option value="deputy_chief_engineer">Bosh muhandis o'rinbosari (Ijro apparati)</option>
                      <option value="press_secretary">Matbuot kotibi (Ijro apparati)</option>
                      <option value="service_head_central_dispatch">Xizmat boshlig'i (Markaziy dispetcherlik xizmati)</option>
                      <option value="dispatcher_central_dispatch">Dispetcher (Markaziy dispetcherlik xizmati)</option>
                      <option value="head_division_gas_objects_efficient">Bo'lim boshlig'i (Gaz ta'minoti ob'ektlaridan samarali foydalanish bo'limi)</option>
                      <option value="senior_engineer_gas_objects_efficient">Yetakchi muhandis (Gaz ta'minoti ob'ektlaridan samarali foydalanish bo'limi)</option>
                      <option value="head_division_labor_protection">Bo'lim boshlig'i (Mehnatni muhofaza qilish, ekologik va sanoat, xavfsizligi bo'limi)</option>
                      <option value="senior_engineer_labor_protection">Yetakchi muhandis (Mehnatni muhofaza qilish, ekologik va sanoat, xavfsizligi bo'limi)</option>
                      <option value="head_division_construction_repair">Bo'lim boshlig'i (Qurilish va ta'mirlash bo'limi)</option>
                      <option value="senior_engineer_construction_repair">Yetakchi muhandis (Qurilish va ta'mirlash bo'limi)</option>
                      <option value="head_division_transport_special">Bo'lim boshlig'i (Transport va maxsus texnika bo'limi)</option>
                      <option value="senior_engineer_transport_special">Yetakchi muhandis (Transport va maxsus texnika bo'limi)</option>
                      <option value="dispatcher_transport_special">Dispetcher (Transport va maxsus texnika bo'limi)</option>
                      <option value="senior_engineer_cadastre">Yetakchi muhandis (Kadastr bo'limi)</option>
                      <option value="head_division_energy_sources_balance">Bo'lim boshlig'i (Energiya manbalari balansini tuzish bo'limi)</option>
                      <option value="senior_specialist_energy_sources_balance">Yetakchi mutaxassis (Energiya manbalari balansini tuzish bo'limi)</option>
                      <option value="head_division_local_consumers">Bo'lim boshlig'i (Mahalla iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="chief_specialist_local_consumers">Bosh mutaxassis (Mahalla iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="senior_engineer_local_consumers">Yetakchi muhandis (Mahalla iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="chief_specialist_electronic_gas">Bosh mutaxassis (Elektron gaz hisoblash uskunalarini texnik jihatdan, tartibga solish va muvofiqlashtirish bo'limi)</option>
                      <option value="senior_engineer_electronic_gas">Yetakchi muhandis (Elektron gaz hisoblash uskunalarini texnik jihatdan, tartibga solish va muvofiqlashtirish bo'limi)</option>
                      <option value="head_division_small_medium_business">Bo'lim boshlig'i (Kichik, o'rta biznes va byudjet, iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="senior_engineer_small_medium_business">Yetakchi muhandis (Kichik, o'rta biznes va byudjet, iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="head_division_large_consumers">Bo'lim boshlig'i (Yirik iste'molchilar bilan ishlash bo'limi)</option>
                      <option value="senior_engineer_large_consumers">Yetakchi muhandis (Yirik iste'molchilar bilan ishlash bo'limi)</option>
                      <option value="head_division_metrological_support">Bo'lim boshlig'i (Metrologik ta'minot bo'limi)</option>
                      <option value="senior_engineer_metrological_support">Yetakchi muhandis (Metrologik ta'minot bo'limi)</option>
                      <option value="senior_specialist_digitalization">Yetakchi mutaxassis (Raqamlashtirish bo'limi)</option>
                      <option value="head_division_control_appeals">Bo'lim boshlig'i (Nazorat va murojaatlar bilan ishlash bo'limi)</option>
                      <option value="senior_specialist_control_appeals">Yetakchi mutaxassis (Nazorat va murojaatlar bilan ishlash bo'limi)</option>
                      <option value="director_assistant_control_appeals">Direktorning yordamchisi (Nazorat va murojaatlar bilan ishlash bo'limi)</option>
                      <option value="call_center_operator">Call Centre operatori (Call Centre xizmati)</option>
                      <option value="head_division_legal">Bo'lim boshlig'i (Yuridik bo'lim)</option>
                      <option value="lawyer_legal">Yurist (Yuridik bo'lim)</option>
                      <option value="head_division_hr_management">Bo'lim boshlig'i (Kadrlarni boshqarish bo'limi)</option>
                      <option value="senior_specialist_hr_management">Yetakchi mutaxassis (Kadrlarni boshqarish bo'limi)</option>
                      <option value="head_division_material_resources">Bo'lim boshlig'i (Moddiy resurslardan oqilona foydalanish va korrupsiyaga qarshi siyosatni amalga oshirish bo'limi)</option>
                      <option value="senior_specialist_material_resources">Yetakchi mutaxassis (Moddiy resurslardan oqilona foydalanish va korrupsiyaga qarshi siyosatni amalga oshirish bo'limi)</option>
                      <option value="head_division_economic_analysis">Bo'lim boshlig'i (Iqtisodiy tahlil bo'limi)</option>
                      <option value="senior_economist_economic_analysis">Yetakchi iqtisodchi (Iqtisodiy tahlil bo'limi)</option>
                      <option value="senior_accountant_accounting">Yetakchi hisobchi (Buxgalteriya hisobi bo'limi)</option>
                      <option value="accountant_accounting">Hisobchi (Buxgalteriya hisobi bo'limi)</option>
                      <option value="senior_engineer_communication_ict">Yetakchi muhandis (Aloqa va AKT xizmati)</option>
                      <option value="technician_communication_ict">Texnik (Aloqa va AKT xizmati)</option>
                      <option value="senior_specialist_special_affairs">Maxsus ishlar bo'yicha yetakchi mutaxassis (Aloqa va AKT xizmati)</option>
                      <option value="warehouse_manager_reserve">Ombor mudiri (Zaxira omborxonasi)</option>
                      <option value="head_division_economy_management">Bo'lim boshlig'i (Xo'jalik boshqaruvi bo'limi)</option>
                      <option value="guard_economy_management">Qorovul (Xo'jalik boshqaruvi bo'limi)</option>
                      <option value="head_city_district_gas">Boshliq ("Shahar/tumangaz" gaz ta'minoti bo'limi)</option>
                      <option value="chief_engineer_city_district_gas">Bosh muhandis ("Shahar/tumangaz" gaz ta'minoti bo'limi)</option>
                      <option value="service_head_gas_objects_technical">Xizmat boshlig'i (Gaz ta'minoti ob'ektlarini texnik tiklash va ishlatish xizmati)</option>
                      <option value="master_gas_objects_technical">Usta (Gaz ta'minoti ob'ektlarini texnik tiklash va ishlatish xizmati)</option>
                      <option value="network_service_specialist">Tarmoqlarga xizmat ko'rsatish chilangari (Gaz ta'minoti ob'ektlarini texnik tiklash va ishlatish xizmati)</option>
                      <option value="electrical_gas_welder">Elektrgazpayvandchi (Gaz ta'minoti ob'ektlarini texnik tiklash va ishlatish xizmati)</option>
                      <option value="senior_engineer_labor_protection_safety">Yetakchi muhandis (Mehnat muhofazasi va texnika xavfsizligi bo'limi)</option>
                      <option value="dispatcher_emergency">Dispetcher (Avariya dispetcherlik xizmati)</option>
                      <option value="emergency_repair_specialist">Avariya tiklash ishlari bo'yicha navbatchi chilangar (Avariya dispetcherlik xizmati)</option>
                      <option value="driver_dispatcher_emergency">Haydovchi (navbatchi) (Avariya dispetcherlik xizmati)</option>
                      <option value="senior_specialist_control_appeals">Yetakchi mutaxassis (Nazorat va murojaatlar bo'limi)</option>
                      <option value="accounting_technician_control">Hisob bo'yicha texnik (Nazorat va murojaatlar bo'limi)</option>
                      <option value="guard_control_appeals">Qorovul (Nazorat va murojaatlar bo'limi)</option>
                      <option value="service_head_local_service">Xizmat boshlig'i (Mahallabay ishlash xizmati)</option>
                      <option value="senior_engineer_local_service">Yetakchi muhandis (Mahallabay ishlash xizmati)</option>
                      <option value="operator_local_service">Operator (Mahallabay ishlash xizmati)</option>
                      <option value="large_region">Yirik hudud</option>
                      <option value="local_gas_specialist_large_region">Mahalla gazchisi (Yirik hudud)</option>
                      <option value="head_division_small_medium_business_local">Bo'lim boshlig'i (Kichik, o'rta biznes va byudjet, iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="senior_engineer_small_medium_business_local">Yetakchi muhandis (Kichik, o'rta biznes va byudjet, iste'molchilari bilan ishlash bo'limi)</option>
                      <option value="head_division_metrological_support_local">Bo'lim boshlig'i (Metrologik ta'minot bo'limi)</option>
                      <option value="engineer_metrologist">Muhandis-metrolog (Metrologik ta'minot bo'limi)</option>
                    </select>
                  )}
                />
                {errors.branch && (
                  <p className="text-red-600 text-xs mt-1">{errors.branch.message}</p>
                )}
              </div>

              {/* Position Field */}
              <div>
                <div className="text-base text-gray-500 mb-2">{t('settings.position')}</div>
                <Controller
                  name="position"
                  control={control}
                  rules={{ required: t('settings.positionRequired') }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="ijro_apparati">Ijro apparati</option>
                      <option value="mahalla_consumers_lpg">Mahalla iste'molchilarini suyultirilgan gaz bilan ta'minlash bo'limi</option>
                      <option value="lpg_facilities">Suyultirilgan gaz inshootlarini ishlatish bo'limi</option>
                      <option value="district_city_lpg">Suyultirilgan gaz ta'minoti bo'yicha tuman (shahar) bo'limlari</option>
                      <option value="household_cylinder_repair">Maishiy gaz ballonlarni ta'mirlash va sinovdan o'tkazish bo'yicha sex</option>
                      <option value="household_cylinder_repair_chiroqchi">Maishiy gaz ballonlarni ta'mirlash va sinovdan o'tkazish bo'yicha sex (Chiroqchi GTSh)</option>
                      <option value="household_cylinder_repair_kasbi">Maishiy gaz ballonlarni ta'mirlash va sinovdan o'tkazish bo'yicha sex (Kasbi GTSh)</option>
                      <option value="household_cylinder_repair_dehqonobod">Maishiy gaz ballonlarni ta'mirlash va sinovdan o'tkazish bo'yicha sex (Dehqonobod GTSh)</option>
                      <option value="gas_filling_stations">Gaz to'ldirish shahobchalari</option>
                    </select>
                  )}
                />
                {errors.position && (
                  <p className="text-red-600 text-xs mt-1">{errors.position.message}</p>
                )}
              </div>

              {/* Employee Level Field */}
              {/*<div>*/}
              {/*  <div className="text-base text-gray-500 mb-2">{t('settings.employeeLevel')}</div>*/}
              {/*  <Controller*/}
              {/*    name="employee_level"*/}
              {/*    control={control}*/}
              {/*    rules={{ required: t('settings.employeeLevelRequired') }}*/}
              {/*    render={({ field }) => (*/}
              {/*      <select*/}
              {/*        {...field}*/}
              {/*        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.employee_level ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}*/}
              {/*      >*/}
              {/*        <option value="junior">Junior</option>*/}
              {/*        <option value="engineer">Engineer</option>*/}
              {/*      </select>*/}
              {/*    )}*/}
              {/*  />*/}
              {/*  {errors.employee_level && (*/}
              {/*    <p className="text-red-600 text-xs mt-1">{errors.employee_level.message}</p>*/}
              {/*  )}*/}
              {/*</div>*/}

              {/* Work Domain Field */}
              {/*<div>*/}
              {/*  <div className="text-base text-gray-500 mb-2">{t('settings.workDomain')}</div>*/}
              {/*  <Controller*/}
              {/*    name="work_domain"*/}
              {/*    control={control}*/}
              {/*    rules={{ required: t('settings.workDomainRequired') }}*/}
              {/*    render={({ field }) => (*/}
              {/*      <select*/}
              {/*        {...field}*/}
              {/*        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.work_domain ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}*/}
              {/*      >*/}
              {/*        <option value="natural_gas">Natural Gas</option>*/}
              {/*        <option value="lpg_gas">LPG Gas</option>*/}
              {/*      </select>*/}
              {/*    )}*/}
              {/*  />*/}
              {/*  {errors.work_domain && (*/}
              {/*    <p className="text-red-600 text-xs mt-1">{errors.work_domain.message}</p>*/}
              {/*  )}*/}
              {/*</div>*/}

              {/* General Error */}
              {errors.root && (
                <div className="text-center">
                  <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
                    {errors.root.message}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-6">
            <div className="flex md:flex-row flex-col md:gap-0 gap-2  md:space-x-4">
              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center flex-1 px-4 py-3 text-base font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('settings.logout')}
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="flex items-center md:order-1 -order-1 justify-center flex-1 px-4 py-3 text-base font-medium text-white bg-[#00A2DE] border border-transparent rounded-lg hover:bg-[#0088C7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {t('settings.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
