"use client";

import { useState, useEffect } from "react";
import { getJsonFiles } from "../actions/getJsonFiles";

interface Report {
  filename: string;
  displayName: string;
}

interface ManageNamesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReports: string[];
  onSave: (reports: string[]) => void;
  disabled?: boolean;
}

export default function ManageNamesDialog({
  isOpen,
  onClose,
  selectedReports,
  onSave,
  disabled
}: ManageNamesDialogProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedReports));

  useEffect(() => {
    const fetchReports = async () => {
      const result = await getJsonFiles();
      if ("files" in result) {
        // Sort by surname
        const sorted = result.files.sort((a, b) => {
          const surnameA = a.displayName.split(" ").pop() || "";
          const surnameB = b.displayName.split(" ").pop() || "";
          return surnameA.localeCompare(surnameB);
        });
        setReports(sorted);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    setSelected(new Set(selectedReports));
  }, [selectedReports]);

  const handleToggle = (filename: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelected(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onClose();
  };

  const allSelected = reports.length > 0 && reports.every(report => selected.has(report.filename));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-[#252525] text-white p-8 rounded-lg w-full max-w-md relative z-10" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Manage Individual Report Access</h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reports.map((report) => (
              <div key={report.filename} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={report.filename}
                  checked={selected.has(report.filename)}
                  onChange={() => handleToggle(report.filename)}
                  disabled={disabled}
                  className={`h-4 w-4 rounded border-gray-300 
                            ${allSelected ? 'text-[#FF6B8A]' : 'text-gray-400'} 
                            focus:ring-[#FF6B8A]`}
                />
                <label htmlFor={report.filename} className="text-base font-medium">
                  {report.displayName}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="button bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="button"
              disabled={disabled}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
