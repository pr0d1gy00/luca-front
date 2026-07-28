"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, UserCog, Mail, ShieldAlert } from "lucide-react";

interface StaffListProps {
  staffList: any[];
  rolesList: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterRole: string;
  setFilterRole: (val: string) => void;
  onOpenInvite: () => void;
}

export function StaffList({
  staffList,
  rolesList,
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
  onOpenInvite,
}: StaffListProps) {
  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Personal de Clínica</h2>
          <p className="text-sm text-slate-500">Gestiona los doctores y enfermeras asociados a esta sucursal.</p>
        </div>
        <Button
          onClick={onOpenInvite}
          className="bg-pharmako-care text-white hover:bg-[#1dbec3] shadow-none"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Personal
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 border border-slate-200 rounded-md">
        <input
          type="text"
          placeholder="Buscar por ID..."
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-pharmako-care"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-pharmako-care bg-white"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="ALL">Todos los roles</option>
          {rolesList.map((r) => (
            <option key={r.id || r.uuid} value={r.id || r.uuid}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* STAFF GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-slate-200 border-dashed rounded-md bg-slate-50">
            No se encontró personal coincidente.
          </div>
        ) : (
          staffList.map((staff) => (
            <div
              key={staff.id || staff.uuid}
              className="p-4 bg-white border border-slate-200 rounded-md flex flex-col gap-3 hover:bg-slate-50 transition-colors duration-150"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 truncate w-32">
                      User: {staff.userUuid || staff.user_id?.split("-")[0]}
                    </h3>
                    <p className="text-xs text-slate-500">{staff.roleName}</p>
                  </div>
                </div>
                <StatusBadge status={staff.status} />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  No disponible offline
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600 hover:text-slate-900">
                  Editar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded">Activo</span>;
  }
  if (status === "PENDING") {
    return <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200 rounded">Pendiente</span>;
  }
  return <span className="px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 rounded">Inactivo</span>;
}
