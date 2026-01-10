'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AttendanceReportList({ sessionId }: { sessionId: string }) {
  const [students, setStudents] = useState<any[]>([]);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/session/${sessionId}/report`);
      setStudents(res.data.students);
    } catch (err) {
      console.error("Report fetch failed");
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Attendance List</h3>
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
          {students.length} Present
        </span>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {students.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Waiting for scans...</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {students.map((s) => (
              <li key={s.id} className="py-2 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.studentName}</p>
                  <p className="text-xs text-gray-500">{s.matricNo}</p>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(s.time).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}