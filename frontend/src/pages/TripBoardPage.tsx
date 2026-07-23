import { useEffect, useMemo, useRef, useState } from "react";
import throttle from "lodash/throttle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { api } from "../services/api";
import type { CreatableModuleType, ModuleType, Trip } from "../types/trip";
import TripHeaderPanel from "../components/TripHeaderPanel";
import GroceryPanel from "../components/GroceryPanel";
import PersonalListPanel from "../components/PersonalListPanel";
import NotesPanel from "../components/NotesPanel";
import WeatherPanel from "../components/WeatherPanel";
import TripMapPanel from "../components/TripMapPanel";
import BoardColumn from "../components/board/BoardColumn";
import BoardModuleCard from "../components/board/BoardModuleCard";
import "../styles/triptrack-board.css";
import BoardModuleCardPreview from "../components/board/BoardModuleCardPreview.tsx";
import { ApiError } from "../services/http.ts";
import { useAuth } from "../auth/AuthContext.tsx";
import InspectorPanel from "../components/board/InspectorPanel.tsx";
import {
  savePanelSettings,
  type SharedSettings,
} from "../services/savePanelSettings.ts";
import type {
  InspectorTarget,
  ModuleSettings,
  TripSettings,
} from "../types/inspectorTypes.ts";
import ToolBar from "../components/board/ToolBar.tsx";

type ModuleProps =
  | { groceryListId: number }
  | { personalListId: number }
  | { noteId: number }
  | undefined;

interface ModuleInstance {
  id: string;
  type: ModuleType;
  title: string;
  panel_color: string;
  props?: ModuleProps;
  created_by?: number | null;
}

type ColumnId = "column-1" | "column-2" | "column-3";
type BoardLayout = Record<ColumnId, string[]>;

function buildInitialLayout(moduleInstances: ModuleInstance[]): BoardLayout {
  const columnIds: ColumnId[] = ["column-1", "column-2", "column-3"];

  const initialLayout: BoardLayout = {
    "column-1": [],
    "column-2": [],
    "column-3": [],
  };

  moduleInstances.forEach((module, index) => {
    const columnId = columnIds[index % columnIds.length];
    initialLayout[columnId].push(module.id);
  });

  return initialLayout;
}

function isColumnId(value: string): value is ColumnId {
  return value === "column-1" || value === "column-2" || value === "column-3";
}

function findContainer(layout: BoardLayout, id: string): ColumnId | null {
  if (isColumnId(id)) {
    return id;
  }

  const columnIds = Object.keys(layout) as ColumnId[];

  for (const columnId of columnIds) {
    if (layout[columnId].includes(id)) {
      return columnId;
    }
  }

  return null;
}

export default function TripBoardPage() {
  const { tripId } = useParams<{ tripId: string }>();

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  const requiredTripId = tripId;
  const { user: currentUser } = useAuth();
  const canManageBoard = !!currentUser;
  const {
    data: trip,
    isPending,
    isError,
  } = useQuery<Trip>({
    queryKey: ["trip", requiredTripId],
    queryFn: () => api.getTrip(requiredTripId),
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        [400, 401, 403, 404].includes(error.status)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const hasMap =
    !!trip &&
    trip.latitude !== null &&
    trip.longitude !== null &&
    !Number.isNaN(Number(trip.latitude)) &&
    !Number.isNaN(Number(trip.longitude));
  const queryClient = useQueryClient();
  const moduleInstances = useMemo<ModuleInstance[]>(() => {
    if (!trip) {
      return [];
    }

    const groceryModules: ModuleInstance[] = trip.grocery_lists.map((list) => ({
      id: `grocery-${list.id}`,
      type: "grocery",
      title: list.title,
      panel_color: list.panel_color,
      props: { groceryListId: list.id },
      created_by: list.created_by,
    }));

    const personalModules: ModuleInstance[] = trip.personal_lists.map(
      (list) => ({
        id: `personal-${list.id}`,
        type: "personal",
        title: list.title,
        panel_color: list.panel_color,
        props: { personalListId: list.id },
        created_by: list.created_by,
      }),
    );

    const noteModules: ModuleInstance[] = trip.notes.map((note) => ({
      id: `note-${note.id}`,
      type: "note",
      title: note.title,
      panel_color: note.panel_color,
      props: { noteId: note.id },
      created_by: note.created_by,
    }));

    const sharedModules: ModuleInstance[] = [
      {
        id: "weather-primary",
        type: "weather",
        title: "Weather",
        panel_color: "blue",
      },
    ];

    if (hasMap) {
      sharedModules.push({
        id: "map-primary",
        type: "map",
        title: "Map",
        panel_color: "green",
      });
    }

    return [
      ...groceryModules,
      ...personalModules,
      ...noteModules,
      ...sharedModules,
    ];
  }, [trip, hasMap]);

  const moduleLookup = useMemo(() => {
    return Object.fromEntries(
      moduleInstances.map((module) => [module.id, module]),
    ) as Record<string, ModuleInstance>;
  }, [moduleInstances]);

  const [layout, setLayout] = useState<BoardLayout>(() =>
    buildInitialLayout(moduleInstances),
  );

  const INSPECTOR_EXIT_MS = 220;

  const [isCreatingPanel, setIsCreatingPanel] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isInspectorVisible, setIsInspectorVisible] = useState(false);
  const [inspectorTarget, setInspectorTarget] =
    useState<InspectorTarget | null>(null);
  const [tripSettings, setTripSettings] = useState<TripSettings>({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const closeTimerRef = useRef<number | null>(null);
  const openFrameRef = useRef<number | null>(null);

  const throttledCrossColumnMove = useRef(
    throttle(
      (
        activeId: string,
        overId: string,
        _getLayout: () => BoardLayout,
        setLayout: React.Dispatch<React.SetStateAction<BoardLayout>>,
      ) => {
        setLayout((current) => {
          const sourceColumn = findContainer(current, activeId);
          const targetColumn = findContainer(current, overId);

          if (!sourceColumn || !targetColumn) {
            return current;
          }

          if (sourceColumn === targetColumn) {
            return current;
          }

          const sourceItems = current[sourceColumn];
          const targetItems = current[targetColumn];

          const sourceIndex = sourceItems.indexOf(activeId);
          if (sourceIndex === -1) {
            return current;
          }

          const alreadyInTarget = targetItems.includes(activeId);
          if (alreadyInTarget) {
            return current;
          }

          const nextSourceItems = [...sourceItems];
          const nextTargetItems = [...targetItems];

          nextSourceItems.splice(sourceIndex, 1);

          if (isColumnId(overId)) {
            nextTargetItems.push(activeId);
          } else {
            const targetIndex = nextTargetItems.indexOf(overId);
            if (targetIndex === -1) {
              return current;
            }
            nextTargetItems.splice(targetIndex, 0, activeId);
          }

          return {
            ...current,
            [sourceColumn]: nextSourceItems,
            [targetColumn]: nextTargetItems,
          };
        });
      },
      80,
      { leading: true, trailing: true },
    ),
  );

  useEffect(() => {
    setLayout((current) => {
      const next = buildInitialLayout(moduleInstances);
      const currentIds = new Set(Object.values(current).flat());
      const nextIds = new Set(moduleInstances.map((module) => module.id));

      if (currentIds.size === 0) {
        return next;
      }

      const filteredCurrent: BoardLayout = {
        "column-1": current["column-1"].filter((id) => nextIds.has(id)),
        "column-2": current["column-2"].filter((id) => nextIds.has(id)),
        "column-3": current["column-3"].filter((id) => nextIds.has(id)),
      };

      const placedIds = new Set(Object.values(filteredCurrent).flat());
      const missingModules = moduleInstances.filter(
        (module) => !placedIds.has(module.id),
      );

      if (missingModules.length === 0) {
        return filteredCurrent;
      }

      const columnIds: ColumnId[] = ["column-1", "column-2", "column-3"];
      missingModules.forEach((module, index) => {
        const columnId = columnIds[index % columnIds.length];
        filteredCurrent[columnId].push(module.id);
      });

      return filteredCurrent;
    });
  }, [moduleInstances]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const inspectorModule =
    inspectorTarget?.kind === "module"
      ? (moduleLookup[inspectorTarget.moduleId] ?? null)
      : null;

  function renderModule(
    instance: ModuleInstance,
    isEditMode = false,
    canEdit = false,
  ) {
    if (!trip) {
      return null;
    }

    switch (instance.type) {
      case "grocery":
        return (
          <GroceryPanel
            tripId={requiredTripId}
            groceryListId={
              (instance.props as { groceryListId: number }).groceryListId
            }
            canEdit={canEdit}
            isEditMode={isEditMode}
          />
        );

      case "personal":
        return (
          <PersonalListPanel
            tripId={requiredTripId}
            personalListId={
              (instance.props as { personalListId: number }).personalListId
            }
            canEdit={canEdit}
            isEditMode={isEditMode}
          />
        );

      case "note":
        return (
          <NotesPanel
            tripId={requiredTripId}
            noteId={(instance.props as { noteId: number }).noteId}
            canEdit={canEdit}
            isEditMode={isEditMode}
          />
        );

      case "weather":
        return <WeatherPanel tripId={requiredTripId} startDate={trip.start_date} endDate={trip.end_date} />;

      case "map":
        return <TripMapPanel trip={trip} />;

      default:
        return null;
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      return;
    }

    setLayout((current) => {
      const sourceColumn = findContainer(current, activeId);
      const targetColumn = findContainer(current, overId);

      if (!sourceColumn || !targetColumn) {
        return current;
      }

      if (sourceColumn !== targetColumn) {
        return current;
      }

      if (isColumnId(overId)) {
        return current;
      }

      const oldIndex = current[sourceColumn].indexOf(activeId);
      const newIndex = current[sourceColumn].indexOf(overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return current;
      }

      return {
        ...current,
        [sourceColumn]: arrayMove(current[sourceColumn], oldIndex, newIndex),
      };
    });
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      return;
    }

    throttledCrossColumnMove.current(activeId, overId, () => layout, setLayout);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function clearInspectorCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openModuleInspector(moduleId: string) {
    if (!canManageBoard) {
      return;
    }
    if (!moduleLookup[moduleId]) {
      return;
    }

    clearInspectorCloseTimer();
    clearInspectorOpenFrame();

    setInspectorTarget({ kind: "module", moduleId });
    setSelectedModuleId(moduleId);
    setIsInspectorVisible(false);

    openFrameRef.current = window.requestAnimationFrame(() => {
      openFrameRef.current = window.requestAnimationFrame(() => {
        setIsInspectorVisible(true);
        openFrameRef.current = null;
      });
    });
  }

  function openTripInspector() {
    if (!canManageBoard) {
      return;
    }

    const open = () => {
      if (!trip) return;
      setTripSettings({
        title: trip.title ?? "",
        description: trip.description ?? "",
        location: trip.location ?? "",
        start_date: trip.start_date ?? "",
        end_date: trip.end_date ?? "",
      });

      clearInspectorCloseTimer();
      clearInspectorOpenFrame();

      setInspectorTarget({ kind: "trip" });
      setSelectedModuleId(null);
      setIsInspectorVisible(false);

      openFrameRef.current = window.requestAnimationFrame(() => {
        openFrameRef.current = window.requestAnimationFrame(() => {
          setIsInspectorVisible(true);
          openFrameRef.current = null;
        });
      });
    };

    if (inspectorTarget) {
      saveCurrentInspectorTarget({
        onSettled: open,
      });
      return;
    }

    open();
  }

  function handleTripInspectorSaveAndClose() {
    saveTripSettingsMutation.mutate(tripSettings, {
      onSettled: () => {
        closeModuleInspector();
      },
    });
  }

  const saveTripSettingsMutation = useMutation({
    mutationFn: (settings: TripSettings) =>
      api.updateTrip(requiredTripId, settings),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trip", requiredTripId],
      });
    },
  });

  function saveCurrentInspectorTarget(options?: { onSettled?: () => void }) {
    if (!inspectorTarget) {
      options?.onSettled?.();
      return;
    }

    if (inspectorTarget.kind === "trip") {
      saveTripSettingsMutation.mutate(tripSettings, {
        onSettled: () => {
          options?.onSettled?.();
        },
      });
      return;
    }

    if (inspectorModule) {
      savePanelSettingsMutation.mutate(
        {
          module: inspectorModule,
          settings: getModuleSettings(inspectorModule.id),
        },
        {
          onSettled: () => {
            options?.onSettled?.();
          },
        },
      );
      return;
    }

    options?.onSettled?.();
  }

  function updateTripSettings(patch: Partial<TripSettings>) {
    setTripSettings((current) => ({
      ...current,
      ...patch,
    }));
  }

  function closeModuleInspector() {
    clearInspectorCloseTimer();
    clearInspectorOpenFrame();

    setSelectedModuleId(null);
    setIsInspectorVisible(false);

    closeTimerRef.current = window.setTimeout(() => {
      setInspectorTarget(null);
      closeTimerRef.current = null;
    }, INSPECTOR_EXIT_MS);
  }

  function toggleModuleEditing(moduleId: string) {
    if (!canManageBoard) {
      return;
    }

    if (selectedModuleId === moduleId) {
      closeModuleInspector();
      return;
    }

    if (inspectorTarget) {
      saveCurrentInspectorTarget({
        onSettled: () => {
          openModuleInspector(moduleId);
        },
      });
      return;
    }

    openModuleInspector(moduleId);
  }

  function isModuleEditing(moduleId: string) {
    return selectedModuleId === moduleId;
  }

  function clearInspectorOpenFrame() {
    if (openFrameRef.current !== null) {
      window.cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }
  }

  useEffect(() => {
    if (!canManageBoard) {
      closeModuleInspector();
    }
  }, [canManageBoard]);

  useEffect(() => {
    return () => {
      clearInspectorCloseTimer();
      clearInspectorOpenFrame();
    };
  }, []);
  const shouldRenderInspector = !!inspectorTarget;
  const [inspectorJiggleY, setInspectorJiggleY] = useState(0);

  useEffect(() => {
    if (!isInspectorVisible) {
      setInspectorJiggleY(0);
      return;
    }

    let frameId = 0;
    let target = 0;
    let current = 0;
    let ticking = false;

    const updateTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      target = Math.max(-6, Math.min(6, (scrollY % 40) * 0.3 - 6));

      if (!ticking) {
        ticking = true;
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      current += (target - current) * 0.18;

      if (Math.abs(target - current) < 0.1) {
        current = target;
        ticking = false;
      } else {
        frameId = window.requestAnimationFrame(animate);
      }

      setInspectorJiggleY(current);
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    updateTarget();

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.cancelAnimationFrame(frameId);
    };
  }, [isInspectorVisible]);

  const [moduleSettingsById, setModuleSettingsById] = useState<
    Record<string, ModuleSettings>
  >({});

  function getModuleSettings(moduleId: string): ModuleSettings {
    return moduleSettingsById[moduleId] ?? {};
  }

  function updateModuleSettings(
    moduleId: string,
    patch: Partial<ModuleSettings>,
  ) {
    setModuleSettingsById((current) => ({
      ...current,
      [moduleId]: {
        ...current[moduleId],
        ...patch,
      },
    }));
  }

  function getInvalidationKeys(
    module: ModuleInstance,
    _tripId: string,
  ): unknown[][] {
    switch (module.type) {
      case "grocery":
        return [
          [
            "groceryList",
            (module.props as { groceryListId: number }).groceryListId,
          ],
        ];
      case "personal":
        return [
          [
            "personalList",
            (module.props as { personalListId: number }).personalListId,
          ],
        ];
      case "note":
        return [["note", (module.props as { noteId: number }).noteId]];
      default:
        return [];
    }
  }

  const savePanelSettingsMutation = useMutation({
    mutationFn: ({
      module,
      settings,
    }: {
      module: ModuleInstance;
      settings: SharedSettings;
    }) => savePanelSettings({ tripId: requiredTripId, module, settings }),
    onSuccess: async (_, { module }) => {
      const keys = getInvalidationKeys(module, requiredTripId);
      await Promise.all(
        keys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
      );
    },
  });

  function handleInspectorSaveAndClose() {
    if (
      !inspectorTarget ||
      inspectorTarget.kind !== "module" ||
      !inspectorModule
    ) {
      closeModuleInspector();
      return;
    }

    savePanelSettingsMutation.mutate(
      {
        module: inspectorModule,
        settings: getModuleSettings(inspectorModule.id),
      },
      {
        onSettled: () => {
          closeModuleInspector();
        },
      },
    );
  }

  if (isPending) {
    return <p className="board-message">Loading dashboard...</p>;
  }

  if (isError || !trip) {
    return (
      <p className="board-message error">Could not load trip dashboard.</p>
    );
  }

  const activeModule = activeId ? moduleLookup[activeId] : null;

  const activePreviewModule = activeModule
    ? {
        ...activeModule,
        title: getModuleSettings(activeModule.id).title ?? activeModule.title,
        panel_color:
          getModuleSettings(activeModule.id).panel_color ??
          activeModule.panel_color,
      }
    : null;

  async function handleAddPanel(type: CreatableModuleType) {
    setIsCreatingPanel(true);

    try {
      if (type === "grocery") {
        return;
        // await api.createGroceryList(requiredTripId, {
        //   title: "New Grocery List",
        // });
      }

      if (type === "personal") {
        return;
        // await api.createPersonalList(requiredTripId, {
        //   title: "New Personal List",
        // });
      }

      await queryClient.invalidateQueries({
        queryKey: ["trip", requiredTripId],
      });
    } finally {
      setIsCreatingPanel(false);
    }
  }

  return (
    <main className="board-page">
      <div className="board-surface">
        <TripHeaderPanel trip={trip} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <section className="trip-board" aria-label="Trip dashboard modules">
            {(Object.keys(layout) as ColumnId[]).map((columnId) => (
              <BoardColumn
                key={columnId}
                title={columnId}
                columnKey={columnId}
                items={layout[columnId]}
              >
                {layout[columnId].map((moduleId) => {
                  const module = moduleLookup[moduleId];

                  if (!module) {
                    return null;
                  }
                  const liveSettings = getModuleSettings(module.id);
                  const liveTitle = liveSettings.title ?? module.title;
                  const livePanelColor =
                    liveSettings.panel_color ?? module.panel_color;

                  const isEditing = isModuleEditing(module.id);
                  const canEditModule =
                    canManageBoard && (trip.is_organizer || module.created_by === currentUser?.id);

                  return (
                    <BoardModuleCard
                      key={module.id}
                      moduleId={module.id}
                      panelColor={livePanelColor}
                      moduleType={module.type}
                      title={liveTitle}
                      isSelected={selectedModuleId === module.id}
                      actions={
                        canEditModule ? (
                          <button
                            type="button"
                            className="panel-mode-toggle"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleModuleEditing(module.id);
                            }}
                          >
                            {isEditing ? "Done" : "Edit"}
                          </button>
                        ) : null
                      }
                    >
                      {renderModule(module, isEditing, canEditModule)}
                    </BoardModuleCard>
                  );
                })}
              </BoardColumn>
            ))}
          </section>

          <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
            {activeId ? (
              <BoardModuleCardPreview module={activePreviewModule} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {canManageBoard ? (
        <ToolBar
          onAdd={handleAddPanel}
          onOpenSettings={openTripInspector}
          isCreating={isCreatingPanel}
        />
      ) : null}

      {canManageBoard  && shouldRenderInspector && inspectorTarget ? (
        <InspectorPanel
          target={inspectorTarget}
          trip={trip}
          module={inspectorModule}
          isVisible={isInspectorVisible}
          jiggleY={inspectorJiggleY}
          settings={
            inspectorTarget.kind === "module" && inspectorModule
              ? getModuleSettings(inspectorModule.id)
              : {}
          }
          tripSettings={tripSettings}
          onTripSettingsChange={updateTripSettings}
          onChange={
            inspectorTarget.kind === "module" && inspectorModule
              ? (patch) => updateModuleSettings(inspectorModule.id, patch)
              : undefined
          }
          onClose={
            inspectorTarget.kind === "module"
              ? handleInspectorSaveAndClose
              : handleTripInspectorSaveAndClose
          }
        />
      ) : null}
    </main>
  );
}
