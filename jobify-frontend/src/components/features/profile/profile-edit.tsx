'use client';

import {
  Avatar,
  Button,
  Modal,
  ModalContent
} from '@/components/ui';
import { useMutation } from '@/hooks/use-api';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Camera,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Giới thiệu không được vượt quá 500 ký tự').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

const ProfileEdit = ({ isOpen, onClose, user, onSuccess }: ProfileEditProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
    }
  });

  const { mutate: updateProfile, loading: isUpdating } = useMutation(
    (data: any) => usersApi.updateUser(user._id, data),
    {
      onSuccess: () => {
        onSuccess();
        handleClose();
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          toast.error('Email đã được sử dụng bởi tài khoản khác');
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      }
    }
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    const formData = new FormData();

    // Add form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Add avatar if selected
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    // Convert FormData to object for API call
    // Note: In real implementation, you'd send FormData directly
    const updateData: any = { ...data };
    if (avatarFile) {
      updateData.avatarFile = avatarFile; // This would be handled by multipart upload
    }

    updateProfile(updateData);
  };

  const handleClose = () => {
    reset();
    setAvatarFile(null);
    setAvatarPreview(null);
    onClose();
  };

  const bioLength = watch('bio')?.length || 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" title="Chỉnh sửa hồ sơ">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar
                src={avatarPreview || user.avatarUrl}
                name={user.name}
                size="xl"
                className="border-4 border-gray-200"
              />

              <div className="absolute bottom-0 right-0 flex gap-1">
                <label className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {(avatarPreview || user.avatarUrl) && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Click vào biểu tượng camera để thay đổi ảnh đại diện
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="0123456789"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('location')}
                  type="text"
                  placeholder="Hà Nội, Việt Nam"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio.message}</p>
                )}
                <p className={`text-sm ml-auto ${bioLength > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                  {bioLength}/500
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={isUpdating}
              disabled={isUpdating}
            >
              {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ProfileEdit;