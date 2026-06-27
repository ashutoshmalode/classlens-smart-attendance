// Generates CSV formatted string from attendance records
export const generateAttendanceCSV = (attendanceRecords) => {
  const headers = [
    'Student ID',
    'Name',
    'Email',
    'Status',
    'Detection Method',
    'Confidence Score',
    'Time Detected'
  ];

  const rows = attendanceRecords.map((record) => {
    const student = record.student || {};
    const dateStr = record.detectedAt
      ? new Date(record.detectedAt).toISOString().replace(/T/, ' ').replace(/\..+/, '')
      : '';

    return [
      `"${(student.studentId || '').replace(/"/g, '""')}"`,
      `"${(student.name || '').replace(/"/g, '""')}"`,
      `"${(student.email || '').replace(/"/g, '""')}"`,
      `"${record.status}"`,
      `"${record.method}"`,
      record.confidence ? record.confidence.toFixed(3) : '1.000',
      `"${dateStr}"`
    ];
  });

  // Combine headers and rows
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
};
