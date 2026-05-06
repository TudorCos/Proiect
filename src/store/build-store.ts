import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Build,
  Product,
  CompatibilityResult,
  CompatibilityIssue,
  CPUSpecs,
  MotherboardSpecs,
  RAMSpecs,
  CaseSpecs,
  GPUSpecs,
  CoolingSpecs,
  PSUSpecs,
} from '@/types';

interface BuildState {
  currentBuild: Build;
  savedBuilds: Build[];

  // Actions
  setCPU: (product: Product | undefined) => void;
  setGPU: (product: Product | undefined) => void;
  setMotherboard: (product: Product | undefined) => void;
  setRAM: (product: Product | undefined) => void;
  addStorage: (product: Product) => void;
  removeStorage: (productId: string) => void;
  setPSU: (product: Product | undefined) => void;
  setCase: (product: Product | undefined) => void;
  setCooling: (product: Product | undefined) => void;
  resetBuild: () => void;
  saveBuild: (name: string) => void;
  loadBuild: (buildId: string) => void;
  deleteBuild: (buildId: string) => void;
}

const createEmptyBuild = (): Build => ({
  id: crypto.randomUUID(),
  userId: '',
  name: 'Build Nou',
  totalPrice: 0,
  isCompatible: true,
  compatibilityIssues: [],
  storage: [],
  createdAt: new Date().toISOString(),
});

// ============================================================
// Compatibility Check Engine
// ============================================================

function checkCompatibility(build: Build): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];

  const cpu = build.cpu;
  const mb = build.motherboard;
  const ram = build.ram;
  const gpu = build.gpu;
  const cooler = build.cooling;
  const psu = build.psu;
  const pcCase = build.case;

  // 1. CPU <-> Motherboard: Socket match
  if (cpu && mb) {
    const cpuSpecs = cpu.specs as CPUSpecs;
    const mbSpecs = mb.specs as MotherboardSpecs;
    if (cpuSpecs.socket !== mbSpecs.socket) {
      issues.push({
        severity: 'error',
        component1: cpu.name,
        component2: mb.name,
        message: `Socket incompatibil: CPU (${cpuSpecs.socket}) ≠ Motherboard (${mbSpecs.socket})`,
      });
    }
  }

  // 2. Motherboard <-> RAM: DDR type match
  if (mb && ram) {
    const mbSpecs = mb.specs as MotherboardSpecs;
    const ramSpecs = ram.specs as RAMSpecs;
    if (mbSpecs.ramType !== ramSpecs.type) {
      issues.push({
        severity: 'error',
        component1: mb.name,
        component2: ram.name,
        message: `Tip RAM incompatibil: Motherboard suportă ${mbSpecs.ramType}, RAM este ${ramSpecs.type}`,
      });
    }
  }

  // 3. GPU <-> Case: Length check
  if (gpu && pcCase) {
    const gpuSpecs = gpu.specs as GPUSpecs;
    const caseSpecs = pcCase.specs as CaseSpecs;
    if (gpuSpecs.length > caseSpecs.maxGPULength) {
      issues.push({
        severity: 'error',
        component1: gpu.name,
        component2: pcCase.name,
        message: `GPU prea lung: ${gpuSpecs.length}mm > max ${caseSpecs.maxGPULength}mm suportat de carcasă`,
      });
    }
  }

  // 4. Cooler <-> Case: Height check
  if (cooler && pcCase) {
    const coolerSpecs = cooler.specs as CoolingSpecs;
    const caseSpecs = pcCase.specs as CaseSpecs;
    if (coolerSpecs.coolingType === 'Air' && coolerSpecs.height) {
      if (coolerSpecs.height > caseSpecs.maxCoolerHeight) {
        issues.push({
          severity: 'error',
          component1: cooler.name,
          component2: pcCase.name,
          message: `Cooler prea înalt: ${coolerSpecs.height}mm > max ${caseSpecs.maxCoolerHeight}mm`,
        });
      }
    }
  }

  // 5. Cooler <-> CPU: Socket compatibility
  if (cooler && cpu) {
    const coolerSpecs = cooler.specs as CoolingSpecs;
    const cpuSpecs = cpu.specs as CPUSpecs;
    if (!coolerSpecs.socket.includes(cpuSpecs.socket)) {
      issues.push({
        severity: 'error',
        component1: cooler.name,
        component2: cpu.name,
        message: `Cooler-ul nu suportă socket-ul ${cpuSpecs.socket}`,
      });
    }
  }

  // 6. PSU wattage warning
  if (psu) {
    const psuSpecs = psu.specs as PSUSpecs;
    let estimatedTDP = 0;
    if (cpu) estimatedTDP += (cpu.specs as CPUSpecs).tdp;
    if (gpu) estimatedTDP += (gpu.specs as GPUSpecs).tdp;
    estimatedTDP += 100; // misc components

    if (psuSpecs.wattage < estimatedTDP) {
      issues.push({
        severity: 'error',
        component1: psu.name,
        component2: 'System',
        message: `Sursa insuficientă: ${psuSpecs.wattage}W < ${estimatedTDP}W consum estimat`,
      });
    } else if (psuSpecs.wattage < estimatedTDP * 1.2) {
      issues.push({
        severity: 'warning',
        component1: psu.name,
        component2: 'System',
        message: `Sursa la limită: recomandat minim ${Math.ceil(estimatedTDP * 1.2)}W (ai ${psuSpecs.wattage}W)`,
      });
    }
  }

  return {
    isCompatible: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}

// ============================================================
// Helper: recalculează prețul total
// ============================================================

function calculateTotalPrice(build: Build): number {
  let total = 0;
  if (build.cpu) total += build.cpu.price;
  if (build.gpu) total += build.gpu.price;
  if (build.motherboard) total += build.motherboard.price;
  if (build.ram) total += build.ram.price;
  if (build.psu) total += build.psu.price;
  if (build.case) total += build.case.price;
  if (build.cooling) total += build.cooling.price;
  if (build.storage) {
    total += build.storage.reduce((sum, s) => sum + s.price, 0);
  }
  return total;
}

function updateBuildMeta(build: Build): Build {
  const result = checkCompatibility(build);
  return {
    ...build,
    totalPrice: calculateTotalPrice(build),
    isCompatible: result.isCompatible,
    compatibilityIssues: result.issues.map((i) => i.message),
  };
}

// ============================================================
// Store
// ============================================================

export const useBuildStore = create<BuildState>()(
  persist(
    (set, get) => ({
      currentBuild: createEmptyBuild(),
  savedBuilds: [],

  setCPU: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, cpu: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  setGPU: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, gpu: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  setMotherboard: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, motherboard: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  setRAM: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, ram: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  addStorage: (product) => {
    set((state) => {
      const updated = {
        ...state.currentBuild,
        storage: [...(state.currentBuild.storage ?? []), product],
      };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  removeStorage: (productId) => {
    set((state) => {
      const updated = {
        ...state.currentBuild,
        storage: (state.currentBuild.storage ?? []).filter(
          (s) => s.id !== productId
        ),
      };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  setPSU: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, psu: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  setCase: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, case: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  setCooling: (product) => {
    set((state) => {
      const updated = { ...state.currentBuild, cooling: product };
      return { currentBuild: updateBuildMeta(updated) };
    });
  },

  resetBuild: () => {
    set({ currentBuild: createEmptyBuild() });
  },

  saveBuild: (name) => {
    const build = get().currentBuild;
    const savedBuild: Build = {
      ...build,
      name,
      savedAt: new Date().toISOString(),
    };
    set((state) => ({
      savedBuilds: [...state.savedBuilds, savedBuild],
      currentBuild: createEmptyBuild(),
    }));
  },

  loadBuild: (buildId) => {
    const build = get().savedBuilds.find((b) => b.id === buildId);
    if (build) {
      set({ currentBuild: { ...build, id: crypto.randomUUID() } });
    }
  },

    deleteBuild: (buildId) => {
      set((state) => ({
        savedBuilds: state.savedBuilds.filter((b) => b.id !== buildId),
      }));
    },
  }),
  {
    name: 'pc-builder-storage', // name of the item in the storage (must be unique)
  }
));
