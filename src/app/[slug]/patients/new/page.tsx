'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientForm } from '@/components/patient/PatientForm';
import { createPatient } from '@/app/actions/patients';

export default function NewPatientPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createPatient(slug as string, data);
      router.push(`/${slug}/patients`);
    } catch (error: any) {
      console.error(error);
      alert('Failed to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Register New Patient</h1>
      <PatientForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
