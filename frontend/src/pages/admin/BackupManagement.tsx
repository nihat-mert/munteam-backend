import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { api } from '../../lib/axios';

export const BackupManagement = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const handleBackup = async () => {
    if (!password) {
      toast.error(t('passwordRequired') || 'Password is required');
      return;
    }

    try {
      setBackupLoading(true);
      const response = await api.post('/admin/backup', { password }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bumlab_backup_${new Date().toISOString().split('T')[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('backupSuccess') || 'Backup downloaded successfully');
      setPassword('');
    } catch (error) {
      toast.error(t('backupError') || 'Backup failed');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!password) {
      toast.error(t('passwordRequired') || 'Password is required');
      return;
    }
    if (!restoreFile) {
      toast.error(t('fileRequired') || 'File is required');
      return;
    }

    try {
      setRestoreLoading(true);
      const formData = new FormData();
      formData.append('file', restoreFile);
      formData.append('password', password);

      await api.post('/admin/restore', formData);
      toast.success(t('restoreSuccess') || 'Database restored successfully');
      setPassword('');
      setRestoreFile(null);
    } catch (error) {
      toast.error(t('restoreError') || 'Restore failed');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      <div className="ml-64 pt-16 p-8">
        <h1 className="text-4xl font-bold mb-8">{t('backupManagement') || 'Backup Management'}</h1>
      
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{t('createBackup') || 'Create Backup'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('adminPassword') || 'Admin Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-accent-500"
                placeholder={t('enterPassword') || 'Enter password'}
              />
            </div>
            <button
              onClick={handleBackup}
              disabled={backupLoading}
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-700 disabled:text-slate-500 rounded font-semibold transition-colors"
            >
              {backupLoading ? t('loading') : t('downloadBackup') || 'Download Backup'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{t('restoreBackup') || 'Restore Backup'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('adminPassword') || 'Admin Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-accent-500"
                placeholder={t('enterPassword') || 'Enter password'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('selectFile') || 'Select SQL File'}</label>
              <input
                type="file"
                accept=".sql"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-accent-500"
              />
            </div>
            <button
              onClick={handleRestore}
              disabled={restoreLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 rounded font-semibold transition-colors"
            >
              {restoreLoading ? t('loading') : t('restoreDatabase') || 'Restore Database'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-200 text-sm">
            ⚠️ {t('backupWarning') || 'Warning: Restoring a backup will overwrite all existing data. Make sure to create a backup before restoring.'}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};
