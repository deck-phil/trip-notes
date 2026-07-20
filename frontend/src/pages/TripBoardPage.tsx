import {useEffect, useMemo, useRef, useState} from "react";
import throttle from "lodash/throttle";
import {useQuery} from "@tanstack/react-query";
import {Navigate, useParams} from "react-router-dom";
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
import {arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import {api, ApiError} from "../services/api";
import type {Trip} from "../types/trip";
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

type ModuleType = "grocery" | "personal" | "notes" | "weather" | "map";

type ModuleProps =
    | { groceryListId: number }
    | { personalListId: number }
    | { noteId: number }
    | undefined;

interface ModuleInstance {
  id: string;
  type: ModuleType;
  title: string;
  props?: ModuleProps;
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
  const {tripId} = useParams<{ tripId: string }>();

  if (!tripId) {
    return <Navigate to="/trips" replace/>;
  }

  const requiredTripId = tripId;

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

  const moduleInstances = useMemo<ModuleInstance[]>(() => {
    if (!trip) {
      return [];
    }

    const groceryModules: ModuleInstance[] = trip.grocery_lists.map((list) => ({
      id: `grocery-${list.id}`,
      type: "grocery",
      title: list.name,
      props: {groceryListId: list.id},
    }));

    const personalModules: ModuleInstance[] = trip.personal_lists.map((list) => ({
      id: `personal-${list.id}`,
      type: "personal",
      title: `${list.username} · ${list.name}`,
      props: {personalListId: list.id},
    }));

    const noteModules: ModuleInstance[] = trip.notes.map((note) => ({
      id: `note-${note.id}`,
      type: "notes",
      title: note.title,
      props: {noteId: note.id},
    }));

    const sharedModules: ModuleInstance[] = [
      {id: "weather-primary", type: "weather", title: "Weather"},
    ];

    if (hasMap) {
      sharedModules.push({id: "map-primary", type: "map", title: "Map"});
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
        moduleInstances.map((module) => [module.id, module])
    ) as Record<string, ModuleInstance>;
  }, [moduleInstances]);

  const [layout, setLayout] = useState<BoardLayout>(() =>
      buildInitialLayout(moduleInstances)
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const throttledCrossColumnMove = useRef(
      throttle(
          (
              activeId: string,
              overId: string,
              _getLayout: () => BoardLayout,
              setLayout: React.Dispatch<React.SetStateAction<BoardLayout>>
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
          {leading: true, trailing: true}
      )
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
      const missingModules = moduleInstances.filter((module) => !placedIds.has(module.id));

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
      })
  );

  function renderModule(instance: ModuleInstance) {
    if (!trip) {
      return null;
    }

    switch (instance.type) {
      case "grocery":
        return (
            <GroceryPanel
                tripId={requiredTripId}
                groceryListId={(instance.props as { groceryListId: number }).groceryListId}
            />
        );

      case "personal":
        return (
            <PersonalListPanel
                tripId={requiredTripId}
                personalListId={(instance.props as { personalListId: number }).personalListId}
            />
        );

      case "notes":
        return (
            <NotesPanel
                tripId={requiredTripId}
                noteId={(instance.props as { noteId: number }).noteId}
            />
        );

      case "weather":
        return <WeatherPanel tripId={requiredTripId}/>;

      case "map":
        return <TripMapPanel trip={trip}/>;

      default:
        return null;
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;

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
    const {active, over} = event;

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

  if (isPending) {
    return <p className="board-message">Loading dashboard...</p>;
  }

  if (isError || !trip) {
    return <p className="board-message error">Could not load trip dashboard.</p>;
  }

  return (
      <main className="board-page">
        <div className="board-surface">
          <TripHeaderPanel trip={trip}/>

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

                      return (
                          <BoardModuleCard
                              key={module.id}
                              moduleId={module.id}
                              moduleType={module.type}
                              title={module.title}
                          >
                            {renderModule(module)}
                          </BoardModuleCard>
                      );
                    })}
                  </BoardColumn>
              ))}
            </section>

            <DragOverlay dropAnimation={{duration: 180, easing: "ease-out"}}>
              {activeId ? (
                  <BoardModuleCardPreview module={moduleLookup[activeId]}/>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
  );
}