import { create } from "zustand";
import type { OrganId } from "@soma/shared-types";

interface CameraStore {
  focusOrganId: OrganId | null;
  focusOrgan: (id: OrganId) => void;
  clearFocus: () => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  focusOrganId: null,
  focusOrgan: (id) => set({ focusOrganId: id }),
  clearFocus: () => set({ focusOrganId: null }),
}));
