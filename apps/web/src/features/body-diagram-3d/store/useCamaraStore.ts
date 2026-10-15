import { create } from "zustand";
import type { OrganId } from "@soma/shared-types";

interface CameraStore {
  /** Organ to frame. Null asks the camera to return to the overview. */
  focusOrganId: OrganId | null;
  /** Bumps only when the requested id actually changes. */
  focusNonce: number;
  requestFocus: (id: OrganId | null) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  focusOrganId: null,
  focusNonce: 0,
  requestFocus: (id) =>
    set((state) =>
      state.focusOrganId === id
        ? state
        : { focusOrganId: id, focusNonce: state.focusNonce + 1 },
    ),
}));
