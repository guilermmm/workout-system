import type { Exercise } from "@prisma/client";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Alert from "../../components/Alert";
import FullPage from "../../components/FullPage";
import Modal from "../../components/Modal";
import QueryErrorAlert from "../../components/QueryErrorAlert";
import Spinner from "../../components/Spinner";
import TextInput from "../../components/TextInput";
import Header from "../../components/admin/Header";
import AdminNavbar from "../../components/admin/Navbar";
import ArrowDownTrayIcon from "../../components/icons/ArrowDownTrayIcon";
import ExclamationTriangleIcon from "../../components/icons/ExclamationTriangleIcon";
import MagnifyingGlassIcon from "../../components/icons/MagnifyingGlassIcon";
import PencilSquareIcon from "../../components/icons/PencilSquareIcon";
import TrashIcon from "../../components/icons/TrashIcon";
import XMarkIcon from "../../components/icons/XMarkIcon";
import { env } from "../../env/server.mjs";
import { getServerAuthSession } from "../../server/auth";
import { useFormValidation, useLocalStorage } from "../../utils";
import { api } from "../../utils/api";

const organizeByParser = z.union([z.literal("name"), z.literal("category")]);

const Dashboard = ({ isSuperUser }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const [organizeBy, setOrganizeBy] = useLocalStorage(
    "exercises-organize-by",
    organizeByParser,
    "category",
  );

  const groups = api.exercise.getGroups.useQuery(undefined, { refetchOnWindowFocus: false });

  const filteredGroups = useMemo(
    () =>
      searchInput === ""
        ? groups.data
        : groups.data
            ?.map(group => {
              const searchLower = searchInput.toLowerCase();

              if (group.category.toLowerCase().includes(searchLower)) {
                return group;
              } else {
                const filteredExercises = group.exercises.filter(e =>
                  e.name.toLowerCase().includes(searchLower),
                );
                return { category: group.category, exercises: filteredExercises };
              }
            })
            .filter(g => g.exercises.length > 0),
    [groups, searchInput],
  );

  const filteredExercises = useMemo(
    () => filteredGroups?.flatMap(g => g.exercises) ?? groups.data?.flatMap(g => g.exercises),
    [filteredGroups, groups],
  );

  const [newExercise, setNewExercise] = useState({ name: "", category: "" });

  const newExerciseNameProps = useFormValidation(
    newExercise.name,
    v => v.length < 1 && "Nome vazio",
    false,
  );

  const newExerciseCategoryProps = useFormValidation(
    newExercise.category,
    v => v.length < 1 && "Categoria vazia",
    false,
  );

  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const [showAddConfirmation, setShowAddConfirmation] = useState(false);

  const addExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setShowExerciseModal(false);
      setShowAddConfirmation(false);
      setNewExercise({ name: "", category: "" });
    },
  });

  const [editedExercise, setEditedExercise] = useState({ name: "", category: "", id: "" });

  useEffect(() => {
    console.log("editedExercise", editedExercise);
  }, [editedExercise]);

  const editedExerciseNameProps = useFormValidation(
    editedExercise.name,
    v => v.length < 1 && "Nome vazio",
    false,
  );

  const editedExerciseCategoryProps = useFormValidation(
    editedExercise.category,
    v => v.length < 1 && "Categoria vazia",
    false,
  );

  const showEditModal = editedExercise.id !== "";

  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  const editExercise = api.exercise.update.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setEditedExercise({ name: "", category: "", id: "" });
      setShowExerciseModal(false);
    },
  });

  const [toBeRemoved, setToBeRemoved] = useState<{ id: string; name: string } | null>(null);

  const removeExercise = api.exercise.delete.useMutation({
    onSuccess: () => {
      setToBeRemoved(null);
      void groups.refetch();
    },
  });

  return (
    <FullPage>
      {showExerciseModal && (
        <Modal
          onClickOutside={() => setShowExerciseModal(false)}
          buttons={
            <>
              <button
                onClick={() => setShowAddConfirmation(true)}
                className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={newExercise.name === "" || newExercise.category === ""}
              >
                Adicionar
              </button>
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => setShowExerciseModal(false)}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="self-center font-medium">Adicionar exercício</h1>
          <TextInput
            label="Nome"
            className="rounded-md bg-white"
            value={newExercise.name}
            onChange={name => setNewExercise({ ...newExercise, name })}
            {...newExerciseNameProps}
          />
          <TextInput
            label="Categoria"
            list="categories"
            className="rounded-md bg-white"
            value={newExercise.category}
            onChange={category => setNewExercise({ ...newExercise, category })}
            {...newExerciseCategoryProps}
          />
          <datalist id="categories">
            {groups.data?.map(group => (
              <option key={group.category} value={group.category} />
            ))}
          </datalist>
        </Modal>
      )}
      {showAddConfirmation && (
        <Alert
          icon={
            <ArrowDownTrayIcon className="h-10 w-10 rounded-full bg-green-200 p-2 text-green-600" />
          }
          title="Adicionar exercício"
          text={`Tem certeza que deseja adicionar ${newExercise.name} como exercício na categoria ${newExercise.category}?`}
          onClickOutside={() => setShowAddConfirmation(false)}
        >
          <button
            className="rounded-md border-1 border-green-600 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => addExercise.mutate(newExercise)}
            disabled={addExercise.isLoading}
          >
            {addExercise.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              "Confirmar"
            )}
          </button>
          {!addExercise.isLoading && (
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setShowAddConfirmation(false)}
            >
              Cancelar
            </button>
          )}
        </Alert>
      )}
      {addExercise.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível criar o exercício"
          text="Não foi possível criar o exercício, tente novamente mais tarde"
          onClickOutside={() => addExercise.reset()}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={addExercise.reset}
          >
            OK
          </button>
        </Alert>
      )}

      {showEditModal && (
        <Modal
          onClickOutside={() => setEditedExercise({ name: "", category: "", id: "" })}
          buttons={
            <>
              <button
                onClick={() => setShowEditConfirmation(true)}
                className="rounded-md bg-blue-500 px-3 py-1 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={editedExercise.name === "" || editedExercise.category === ""}
              >
                Salvar
              </button>
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => setEditedExercise({ name: "", category: "", id: "" })}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="self-center font-medium">Editar exercício</h1>
          <TextInput
            label="Nome"
            className="rounded-md bg-white"
            value={editedExercise.name}
            onChange={name => setEditedExercise({ ...editedExercise, name })}
            {...editedExerciseNameProps}
          />
          <TextInput
            label="Categoria"
            list="categories"
            className="rounded-md bg-white"
            value={editedExercise.category}
            onChange={category => setEditedExercise({ ...editedExercise, category })}
            {...editedExerciseCategoryProps}
          />
          <datalist id="categories">
            {groups.data?.map(group => (
              <option key={group.category} value={group.category} />
            ))}
          </datalist>
        </Modal>
      )}
      {showEditConfirmation && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-700" />
          }
          title="Alterar exercício"
          text={`Tem certeza que deseja alterar ${editedExercise.name} como exercício na categoria ${editedExercise.category}?`}
          onClickOutside={() => setShowEditConfirmation(false)}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => editExercise.mutate(editedExercise)}
            disabled={editExercise.isLoading}
          >
            {editExercise.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              "Confirmar"
            )}
          </button>
          {!editExercise.isLoading && (
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setShowEditConfirmation(false)}
            >
              Cancelar
            </button>
          )}
        </Alert>
      )}
      {editExercise.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível editar o exercício"
          text="Não foi possível editar o exercício, tente novamente mais tarde"
          onClickOutside={() => editExercise.reset()}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={editExercise.reset}
          >
            OK
          </button>
        </Alert>
      )}

      {toBeRemoved && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title={`Tem certeza que deseja remover ${toBeRemoved.name}?`}
          text={`Todos os treinos que contém ${toBeRemoved.name} serão afetados, e não será possível desfazer esta ação`}
          onClickOutside={() => setToBeRemoved(null)}
        >
          <button
            className="rounded-md border-1 border-red-600 bg-red-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => removeExercise.mutate({ id: toBeRemoved.id })}
            disabled={removeExercise.isLoading}
          >
            {removeExercise.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              "Confirmar"
            )}
          </button>
          {!removeExercise.isLoading && (
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setToBeRemoved(null)}
            >
              Cancelar
            </button>
          )}
        </Alert>
      )}
      {removeExercise.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível remover o exercício"
          text="Não foi possível remover o exercício, tente novamente mais tarde"
          onClickOutside={() => removeExercise.reset()}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={removeExercise.reset}
          >
            OK
          </button>
        </Alert>
      )}

      <QueryErrorAlert queries={[groups]} />
      <Header user={session?.user} />
      <div className="m-2 flex items-center gap-2">
        <div className="relative grow">
          <input
            type="text"
            className="block h-12 w-full appearance-none rounded-full pl-4 pr-12 shadow-md outline-none ring-0 focus:outline-none focus:ring-0"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
        </div>
        <div>
          <div className="inline-flex">
            <span className="mr-1 text-sm font-medium text-gray-900">Alfabética</span>
            <label className="relative cursor-pointer items-center">
              <input
                type="checkbox"
                checked={organizeBy === "category"}
                onChange={e => setOrganizeBy(e.target.checked ? "category" : "name")}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
            </label>
            <span className="ml-1 text-sm font-medium text-gray-900">Categoria</span>
          </div>
        </div>
      </div>
      <div className="mb-2 flex justify-end px-2">
        <button
          className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-sm text-white shadow-md"
          onClick={() => setShowExerciseModal(true)}
        >
          Adicionar novo exercício
        </button>
      </div>
      <div className="relative grow overflow-y-auto">
        <div className="mx-4 flex h-full flex-1 grow flex-col items-center gap-4">
          {groups.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            filteredGroups && (
              <div className="flex w-full max-w-[32rem] flex-col gap-1">
                {organizeBy === "category"
                  ? filteredGroups.map(category => (
                      <CategoryCard
                        {...category}
                        key={category.category}
                        handleRemoveExercise={e => () => setToBeRemoved(e)}
                        handleEditExercise={e => () => setEditedExercise(e)}
                      />
                    ))
                  : filteredExercises?.map(exercise => (
                      <ExerciseCard
                        {...exercise}
                        key={exercise.id}
                        showCategory
                        handleRemoveExercise={e => () => setToBeRemoved(e)}
                        handleEditExercise={e => () => setEditedExercise(e)}
                      />
                    ))}
              </div>
            )
          )}
        </div>
      </div>
      <AdminNavbar isSuperUser={isSuperUser} />
    </FullPage>
  );
};

const ExerciseCard = ({
  id,
  name,
  category,
  showCategory = false,
  handleRemoveExercise,
  handleEditExercise,
}: {
  id: string;
  name: string;
  category: string;
  showCategory?: boolean;
  handleRemoveExercise: (e: { id: string; name: string }) => () => void;
  handleEditExercise: (e: { id: string; name: string; category: string }) => () => void;
}) => {
  return (
    <div className="flex max-w-[calc(100vw_-_2rem)] flex-1 flex-row items-center justify-between rounded-md bg-blue-500">
      <div className="flex w-full flex-col justify-between truncate px-3 py-2">
        <div className="text-md truncate text-white">{name}</div>
        {showCategory && <div className="truncate text-sm text-slate-100">{category}</div>}
      </div>
      <div className="flex items-center justify-center gap-1 px-3">
        <button onClick={handleEditExercise({ id, name, category })}>
          <PencilSquareIcon className="h-6 w-6 text-gold-500" />
        </button>
        <button onClick={handleRemoveExercise({ id, name })}>
          <TrashIcon className="h-6 w-6 text-red-500" />
        </button>
      </div>
    </div>
  );
};

const CategoryCard = ({
  category,
  exercises,
  handleRemoveExercise,
  handleEditExercise,
}: {
  category: string;
  exercises: Exercise[];
  handleRemoveExercise: (e: { id: string; name: string }) => () => void;
  handleEditExercise: (e: { id: string; name: string; category: string }) => () => void;
}) => {
  return (
    <div className="flex flex-1 flex-col" key={category}>
      <div className="w-min">
        <div className="text-lg font-medium text-slate-800">{category}</div>
        <div className="mb-2 h-1 w-full bg-gold-500" />
      </div>
      <div className="flex flex-col gap-1">
        {exercises.map(exercise => (
          <ExerciseCard
            {...exercise}
            key={exercise.id}
            handleRemoveExercise={handleRemoveExercise}
            handleEditExercise={handleEditExercise}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
