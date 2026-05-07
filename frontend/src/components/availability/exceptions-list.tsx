'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import type { AvailabilityException } from '@/types/availability';

export function ExceptionsList() {
  const t = useTranslations('Dashboard.availability');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [exceptionToDelete, setExceptionToDelete] = useState<string | null>(null);
  const [editingException, setEditingException] = useState<AvailabilityException | null>(null);
  const [dateError, setDateError] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    isAvailable: true,
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/availability/exceptions`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to fetch exceptions');

      const data = await response.json();
      setExceptions(data);
    } catch (error) {
      console.error('Error fetching exceptions:', error);
      toast.error(t('saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (exception?: AvailabilityException) => {
    if (exception) {
      setEditingException(exception);
      // Normalize date from ISO to YYYY-MM-DD for date input
      const dateOnly = exception.date.split('T')[0];
      setFormData({
        date: dateOnly,
        isAvailable: exception.isAvailable,
        startTime: exception.startTime || '09:00',
        endTime: exception.endTime || '17:00',
      });
    } else {
      setEditingException(null);
      setFormData({
        date: '',
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
      });
    }
    setDateError(false);
    setIsDialogOpen(true);
  };

  const handleSaveException = async () => {
    if (!formData.date) {
      toast.error(t('exceptionDateRequired'));
      setDateError(true);
      return;
    }

    setDateError(false);

    // Normalize date to YYYY-MM-DD format
    const selectedDateOnly = formData.date.includes('T') 
      ? formData.date.split('T')[0] 
      : formData.date;

    // Check if date is in the past (only when creating new exception)
    if (!editingException) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
      const selectedDate = new Date(selectedDateOnly + 'T00:00:00');
      
      if (selectedDate < today) {
        toast.error(t('pastDateNotAllowed') || 'Nie możesz dodać wyjątku dla daty z przeszłości');
        setDateError(true);
        return;
      }
    }

    // Check for duplicate date (only when creating new exception)
    if (!editingException) {
      const duplicateException = exceptions.find(e => {
        const existingDateOnly = e.date.split('T')[0];
        return existingDateOnly === selectedDateOnly;
      });

      if (duplicateException) {
        toast.error(t('duplicateExceptionDate'));
        setDateError(true);
        return;
      }
    }

    if (formData.isAvailable && formData.startTime >= formData.endTime) {
      toast.error(t('endBeforeStart'));
      return;
    }

    try {
      const url = editingException
        ? `${process.env.NEXT_PUBLIC_API_URL}/availability/exceptions/${editingException.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/availability/exceptions`;

      const response = await fetch(url, {
        method: editingException ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: formData.date,
          isAvailable: formData.isAvailable,
          startTime: formData.isAvailable ? formData.startTime : null,
          endTime: formData.isAvailable ? formData.endTime : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save exception');

      toast.success(t('saveSuccess'));
      setIsDialogOpen(false);
      
      // Refresh exceptions list
      await fetchExceptions();
      
      window.dispatchEvent(new CustomEvent('exceptionsUpdated'));
    } catch (error) {
      console.error('Error saving exception:', error);
      toast.error(t('saveError'));
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/availability/exceptions/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to delete exception');

      toast.success(t('deleteSuccess'));
      fetchExceptions();
      setIsDeleteDialogOpen(false);
      setExceptionToDelete(null);
      
      window.dispatchEvent(new CustomEvent('exceptionsUpdated'));
    } catch (error) {
      console.error('Error deleting exception:', error);
      toast.error(t('deleteError'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 py-2.5 text-base font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('addException')}
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingException ? t('editException') : t('addException')}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {formData.isAvailable ? t('customHours') : t('dayOff')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="exception-date" className="text-base font-medium">
                {t('exceptionDate')} <span className="text-red-500">*</span>
              </Label>
              <input
                id="exception-date"
                type="date"
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  setDateError(false);
                }}
                required
                className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 cursor-pointer ${
                  dateError 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-slate-600 focus:ring-purple-500'
                }`}
                style={{
                  colorScheme: 'dark',
                }}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="text-base font-medium">{t('exceptionType')}</Label>
              <Select
                value={formData.isAvailable ? 'available' : 'unavailable'}
                onValueChange={(value) =>
                  setFormData({ ...formData, isAvailable: value === 'available' })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white hover:bg-slate-800 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                  <SelectItem value="available" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                    {t('customHours')}
                  </SelectItem>
                  <SelectItem value="unavailable" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                    {t('dayOff')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Range (only if available) */}
            {formData.isAvailable && (
              <div className="space-y-2">
                <Label className="text-base font-medium">{t('startTime')} - {t('endTime')}</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-slate-400">—</span>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="flex-1 border-slate-600 bg-slate-900 hover:bg-slate-700 text-white h-11"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSaveException}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-11"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exceptions List */}
      {exceptions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('noExceptions')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <CalendarIcon className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-white font-medium">
                    {format(new Date(exception.date.split('T')[0] + 'T12:00:00'), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
                  </p>
                  {exception.isAvailable ? (
                    <p className="text-sm text-slate-400">
                      {exception.startTime} - {exception.endTime}
                    </p>
                  ) : (
                    <p className="text-sm text-red-400">{t('dayOff')}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenDialog(exception)}
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-9 px-3"
                  variant="ghost"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => {
                    setExceptionToDelete(exception.id);
                    setIsDeleteDialogOpen(true);
                  }}
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 px-3"
                  variant="ghost"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-400">
              {t('confirmDeleteTitle')}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {t('confirmDelete')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setExceptionToDelete(null);
                }}
                variant="outline"
                className="flex-1 border-slate-600 bg-slate-900 hover:bg-slate-700 text-white h-11"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => exceptionToDelete && handleDeleteException(exceptionToDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11"
              >
                {t('deleteException')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
