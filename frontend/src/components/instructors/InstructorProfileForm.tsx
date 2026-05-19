'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { InstructorProfile, InstructorListing, User } from '@/types';
import { useUpdateInstructorProfile } from '@/hooks/useUpdateInstructorProfile';
import { useUploadProfilePhoto, useUploadGalleryPhotos } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { instructorProfileSchema, type InstructorProfileFormData } from '@/lib/validations/schemas/instructor-profile';
import { useTags, useSpecializations, useGoals, getTagName, getGoalName } from '@/hooks/useConfig';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MediaUpload } from '@/components/instructors/MediaUpload';
import { ContactSettingsSection } from '@/components/instructors/ContactSettingsSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAX_TAGS = 8;
const MAX_GOALS = 4;
const MAX_ADDITIONAL_SPECIALIZATIONS = 2;

interface InstructorProfileFormProps {
  profile?: InstructorProfile | InstructorListing;
  user: Pick<User, 'email' | 'phone'>;
}

export function InstructorProfileForm({ profile, user }: InstructorProfileFormProps) {
  const t = useTranslations('Dashboard.profileForm');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const { mutate: updateProfile } = useUpdateInstructorProfile();
  const { mutate: uploadPhoto, isPending: isUploadingPhoto } = useUploadProfilePhoto();
  const { mutate: uploadGallery, isPending: isUploadingGallery } = useUploadGalleryPhotos();

  const { tags, loading: tagsLoading } = useTags();
  const { specializations, loading: specializationsLoading } = useSpecializations();
  const { goals, loading: goalsLoading } = useGoals();
  
  
  // State for multi-selects
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string | undefined>(
    profile?.specializations?.[0] || undefined
  );
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    profile?.specializations?.slice(1) || [] // Exclude primary to avoid duplication
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    profile?.goals || []
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string>(
    profile?.availability || 'both'
  );

  useEffect(() => { 
    if (!tagsLoading && tags.length > 0 && profile?.tags) {
      const validTags = profile.tags.filter((tag: string) => tags.some(t => t.id === tag));
      setSelectedTags(validTags);
    }
  }, [tagsLoading, tags, profile?.tags]);

  const form = useForm<InstructorProfileFormData>({
    resolver: zodResolver(instructorProfileSchema),
    defaultValues: {
      bio: profile?.bio || '',
      tagline: profile?.tagline || '',
      city: profile?.city || '',
      hourlyRate: profile?.hourlyRate ?? undefined,
      hourlyRateHidden: profile?.hourlyRateHidden || false,
      packageDealsEnabled: profile?.packageDealsEnabled || false,
      packageDealsDescription: profile?.packageDealsDescription || '',
      photoUrl: profile?.photoUrl || '',
      languages: profile?.languages?.join(', ') || '',
      gallery: profile?.gallery || [],
      yearsExperience: profile?.yearsExperience ?? undefined,
      showPhone: profile?.showPhone || false,
      showEmail: profile?.showEmail || false,
      contactMessage: profile?.contactMessage || '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form;

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || '',
        tagline: profile.tagline || '',
        city: profile.city || '',
        hourlyRate: profile.hourlyRate ?? undefined,
        hourlyRateHidden: profile.hourlyRateHidden || false,
        packageDealsEnabled: profile.packageDealsEnabled || false,
        packageDealsDescription: profile.packageDealsDescription || '',
        photoUrl: profile.photoUrl || '',
        languages: profile.languages?.join(', ') || '',
        gallery: profile.gallery || [],
        yearsExperience: profile.yearsExperience ?? undefined,
        showPhone: profile.showPhone || false,
        showEmail: profile.showEmail || false,
        contactMessage: profile.contactMessage || '',
      });
    }
  }, [profile, reset]);

  // Get available tags based on primary category
  const availableTags = selectedPrimaryCategory
  ? tags.filter(tag => tag.categories.includes(selectedPrimaryCategory))
  : tags;

  // Toggle functions
  const toggleSpecialization = (id: string) => {
    if (selectedSpecializations.includes(id)) {
      setSelectedSpecializations(prev => prev.filter(s => s !== id));
    } else if (selectedSpecializations.length < MAX_ADDITIONAL_SPECIALIZATIONS) {
      setSelectedSpecializations(prev => [...prev, id]);
    }
  };

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(prev => prev.filter(t => t !== id));
    } else if (selectedTags.length < MAX_TAGS) {
      setSelectedTags(prev => [...prev, id]);
    }
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(prev => prev.filter(g => g !== id));
    } else if (selectedGoals.length < MAX_GOALS) {
      setSelectedGoals(prev => [...prev, id]);
    }
  };

  const onSubmit = (data: InstructorProfileFormData) => {
    if (!profile?.id) {
      toast.error(t('profileNotFound'));
      return;
    }

    const formattedData = {
      ...data,
      specializations: selectedPrimaryCategory ? [selectedPrimaryCategory, ...selectedSpecializations] : selectedSpecializations,
      tags: selectedTags,
      goals: selectedGoals,
      availability: selectedAvailability,
      hourlyRate: data.hourlyRate ?? null,
      hourlyRateHidden: data.hourlyRateHidden || false,
      packageDealsEnabled: data.packageDealsEnabled || false,
      packageDealsDescription: data.packageDealsEnabled ? data.packageDealsDescription : null,
      yearsExperience: data.yearsExperience ?? null,
      languages: typeof data.languages === 'string'
        ? (data.languages as string).split(',').map(s => s.trim()).filter(Boolean)
        : data.languages,
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      photoUrl: data.photoUrl && data.photoUrl.trim() !== '' ? data.photoUrl.trim() : null,
    };

    updateProfile(
      { profileId: profile.id, data: { ...formattedData, isDraft: true } },
      {
        onSuccess: () => {
          toast.success(t('draftSaved'));
          router.push('/dashboard/profile/preview');
        },
        onError: (error) => {
          toast.error(`${t('updateError')}: ${error.message}`);
        },
      }
    );
  };

  return ( 
    <form id="instructor-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* === BASIC INFO SECTION === */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            {t('basicInfoTitle')}
          </h2>
          <p className="text-sm text-slate-400">{t('basicInfoSubtitle')}</p>
        </div>
        
        <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="tagline" className="block text-base font-semibold text-slate-200">
          {t('tagline')}
        </label>
        <p className="text-sm text-slate-400 mb-2">{t('taglineHint')}</p>
        <input
          {...register('tagline')}
          id="tagline"
          type="text"
          placeholder={t('taglinePlaceholder')}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        {errors.tagline && (
          <p className="text-red-400 text-sm">{errors.tagline.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label htmlFor="bio" className="block text-base font-semibold text-slate-200">
          {t('bio')}
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={5}
          placeholder={t('bioPlaceholder')}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
        />
        {errors.bio && (
          <p className="text-red-400 text-sm">{errors.bio.message}</p>
        )}
      </div>
        </div>
      </div>

      {/* === SPECIALIZATION SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            {t('specializationTitle')}
          </h2>
          <p className="text-sm text-slate-400">{t('specializationSubtitle')}</p>
        </div>
        
        <div className="space-y-5">

      {/* Primary Specialization */}
      <div>
        <label htmlFor="primarySpec" className="block text-base font-semibold text-slate-200 mb-2">
          {t('primarySpecialization')}
        </label>
        <Select
          value={selectedPrimaryCategory}
          onValueChange={(value) => {
            setSelectedPrimaryCategory(value);
            setSelectedSpecializations([]); // Reset subcategories when changing primary
            setSelectedTags([]); // Reset tags when changing primary
          }}
          disabled={specializationsLoading}
        >
          <SelectTrigger className="w-full bg-slate-900/50 border-slate-600 text-slate-100">
            <SelectValue 
              placeholder={specializationsLoading ? tCommon('loading') : t('primarySpecializationPlaceholder')} 
            />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {specializations.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="text-slate-100 focus:bg-slate-800 focus:text-white"
              >
                {category.icon} {locale === 'pl' ? category.namePl : category.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Specializations */}
      {selectedPrimaryCategory && (
        <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5">
          <h3 className="text-base font-semibold text-white mb-2">
            {t('additionalSpecializations')}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {t('additionalSpecializationsHint', { max: MAX_ADDITIONAL_SPECIALIZATIONS })}
            {selectedSpecializations.length >= MAX_ADDITIONAL_SPECIALIZATIONS && (
              <span className="text-orange-400 ml-2">({t('maximumReached')})</span>
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {specializations
              .filter(spec => spec.id !== selectedPrimaryCategory)
              .map((spec) => {
                const isChecked = selectedSpecializations.includes(spec.id);
                const isDisabled = !isChecked && selectedSpecializations.length >= MAX_ADDITIONAL_SPECIALIZATIONS;
                return (
                  <label
                    key={spec.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleSpecialization(spec.id)}
                      className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span
                      className={`text-sm select-none transition-colors ${
                        isChecked
                          ? 'font-semibold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                          : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {spec.icon} {locale === 'pl' ? spec.namePl : spec.nameEn}
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {availableTags.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5">
          <h3 className="text-base font-semibold text-white mb-2">
            {t('tags')}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {t('tagsHint', { max: MAX_TAGS })}
            {selectedTags.length >= MAX_TAGS && (
              <span className="text-orange-400 ml-2">({t('tagsMaxReached', { max: MAX_TAGS })})</span>
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
            {availableTags.map((tag) => {
              const isChecked = selectedTags.includes(tag.id);
              const isDisabled = !isChecked && selectedTags.length >= MAX_TAGS;
              return (
                <label
                  key={tag.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={isDisabled}
                    onCheckedChange={() => toggleTag(tag.id)}
                    className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <span
                    className={`text-sm select-none transition-colors ${
                      isChecked
                        ? 'font-semibold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {getTagName(tag, locale)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals Section */}
      <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5">
        <h3 className="text-base font-semibold text-white mb-2">
          {t('goals')}
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          {t('goalsHint')}
          {selectedGoals.length >= MAX_GOALS && (
            <span className="text-orange-400 ml-2">({t('goalsMaxReached', { max: MAX_GOALS })})</span>
          )}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const isChecked = selectedGoals.includes(goal.id);
            const isDisabled = !isChecked && selectedGoals.length >= MAX_GOALS;
            return (
              <label
                key={goal.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50'
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  disabled={isDisabled}
                  onCheckedChange={() => toggleGoal(goal.id)}
                  className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <span
                  className={`text-sm select-none transition-colors ${
                    isChecked
                      ? 'font-semibold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                      : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {goal.icon} {getGoalName(goal, locale)}
                </span>
              </label>
            );
          })}
        </div>
      </div>
        </div>
      </div>

      {/* === LOCATION & PRICING SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            {t('locationPricingTitle')}
          </h2>
          <p className="text-sm text-slate-400">{t('locationPricingSubtitle')}</p>
        </div>
        
        <div className="space-y-5">

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-slate-200">
          {t('availability')}
        </Label>
        <RadioGroup
          value={selectedAvailability}
          onValueChange={setSelectedAvailability}
          className="space-y-3"
        >
          <label className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <RadioGroupItem value="online" className="border-slate-600" />
            <span className="text-slate-200">{t('availabilityOnline')}</span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <RadioGroupItem value="in-person" className="border-slate-600" />
            <span className="text-slate-200">{t('availabilityInPerson')}</span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <RadioGroupItem value="both" className="border-slate-600" />
            <span className="text-slate-200">{t('availabilityBoth')}</span>
          </label>
        </RadioGroup>
      </div>

      {/* Location & City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-base font-semibold text-slate-200">
            {t('city')}
          </Label>
          <Input
            {...register('city')}
            id="city"
            type="text"
            placeholder={t('cityPlaceholder')}
            className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
          />
          {errors.city && (
            <p className="text-red-400 text-sm">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsExperience" className="text-base font-semibold text-slate-200">
            {t('yearsExperience')} <span className="text-slate-400 text-sm font-normal">{t('hourlyRateOptional')}</span>
          </Label>
          <Input
            {...register('yearsExperience', { 
              setValueAs: (v) => v === '' || v === null || v === undefined ? undefined : Number(v)
            })}
            id="yearsExperience"
            type="number"
            placeholder={t('yearsExperiencePlaceholder')}
            className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
          />
          {errors.yearsExperience && (
            <p className="text-red-400 text-sm">{errors.yearsExperience.message}</p>
          )}
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="space-y-2">
        <Label 
          htmlFor="hourlyRate" 
          className={`text-base font-semibold ${watch('hourlyRateHidden') ? 'text-slate-500' : 'text-slate-200'}`}
        >
          {t('hourlyRate')} <span className="text-slate-400 text-sm font-normal">{t('hourlyRateOptional')}</span>
        </Label>
        <Input
          {...register('hourlyRate', { 
            setValueAs: (v) => v === '' || v === null || v === undefined ? undefined : Number(v)
          })}
          id="hourlyRate"
          type="number"
          step="0.01"
          placeholder={t('hourlyRatePlaceholder')}
          disabled={watch('hourlyRateHidden')}
          className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.hourlyRate && (
          <p className="text-red-400 text-sm">{errors.hourlyRate.message}</p>
        )}
        
        {/* Hide Hourly Rate Checkbox */}
        <label className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700 mt-2">
          <Controller
            name="hourlyRateHidden"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
            )}
          />
          <div className="flex flex-col">
            <span className={`text-sm font-medium select-none ${
              watch('hourlyRateHidden') 
                ? 'bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent' 
                : 'text-slate-200'
            }`}>
              {t('hourlyRateHidden')}
            </span>
            <span className="text-sm text-slate-400">
              {t('hourlyRateHiddenHint')}
            </span>
          </div>
        </label>
      </div>

      {/* Package Deals Checkbox */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700">
          <Controller
            name="packageDealsEnabled"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  field.onChange(isChecked);
                  if (!isChecked) {
                    setValue('packageDealsDescription', '');
                  }
                }}
                className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
            )}
          />
          <span className={`text-base font-medium select-none ${
            watch('packageDealsEnabled') 
              ? 'bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent' 
              : 'text-slate-200'
          }`}>
            {t('packageDealsEnabled')}
          </span>
        </label>
        
        {/* Package Deals Description - pokazuje się tylko gdy checkbox zaznaczony */}
        {watch('packageDealsEnabled') && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="packageDealsDescription" className="text-base font-semibold text-slate-200">
              {t('packageDealsDescription')}
            </Label>
            <Textarea
              {...register('packageDealsDescription')}
              id="packageDealsDescription"
              placeholder={t('packageDealsPlaceholder')}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
            />
            <p className="text-slate-400 text-sm">
              {t('packageDealsHint')}
            </p>
            {errors.packageDealsDescription && (
              <p className="text-red-400 text-sm">{errors.packageDealsDescription.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label htmlFor="languages" className="text-base font-semibold text-slate-200">
          {t('languages')}
        </Label>
        <Input
          {...register('languages')}
          id="languages"
          type="text"
          placeholder={t('languagesPlaceholder')}
          className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
        />
        {errors.languages && (
          <p className="text-red-400 text-sm">{errors.languages.message}</p>
        )}
      </div>
        </div>
      </div>

      {/* === CONTACT & MEDIA SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            {t('contactMediaTitle')}
          </h2>
          <p className="text-sm text-slate-400">{t('contactMediaSubtitle')}</p>
        </div>
        
        <div className="space-y-5">

      {/* Contact Settings Section */}
      <ContactSettingsSection 
        form={form}
        userPhone={user.phone}
        userEmail={user.email}
      />

      {/* Photo URL */}
      <MediaUpload
        variant="avatar"
        currentMediaUrl={watch('photoUrl')}
        onMediaChange={(url) => setValue('photoUrl', url as string)}
        onUpload={async (file) => {
          return new Promise<string>((resolve, reject) => {
            uploadPhoto(file as File, {
              onSuccess: (url) => {
                toast.success(t('photoUploadSuccess'));
                resolve(url);
              },
              onError: (error) => {
                toast.error(t('photoUploadError'));
                reject(error);
              }
            });
          });
        }}
        isUploading={isUploadingPhoto}
        label={t('photoUrl')}
      />
      {errors.photoUrl && (
        <p className="text-red-400 text-sm">{errors.photoUrl.message}</p>
      )}

      {/* Gallery */}
      <MediaUpload
        variant="gallery"
        currentMediaUrls={Array.isArray(watch('gallery')) ? watch('gallery') as string[] : []}
        onMediaChange={(urls) => setValue('gallery', urls as string[])}
        onUpload={async (files) => {
          return new Promise<string[]>((resolve, reject) => {
            uploadGallery(files as File[], {
              onSuccess: (urls) => {
                toast.success(t('galleryUploadSuccess'));
                resolve(urls);
              },
              onError: (error) => {
                toast.error(t('galleryUploadError'));
                reject(error);
              }
            });
          });
        }}
        isUploading={isUploadingGallery}
        label={t('gallery')}
        maxFiles={10}
        acceptVideo={true}
      />
      {errors.gallery && (
        <p className="text-red-400 text-sm">{errors.gallery.message}</p>
      )}
        </div>
      </div>
    </form>
  );
}
