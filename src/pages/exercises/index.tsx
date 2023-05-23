import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Alert from "../../components/Alert";
import FullPage from "../../components/FullPage";
import { ImageInput } from "../../components/ImageInput";
import Modal from "../../components/Modal";
import QueryErrorAlert from "../../components/QueryErrorAlert";
import Spinner from "../../components/Spinner";
import TextInput from "../../components/TextInput";
import Header from "../../components/admin/Header";
import AdminNavbar from "../../components/admin/Navbar";
import ArrowDownTrayIcon from "../../components/icons/ArrowDownTrayIcon";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import ExclamationTriangleIcon from "../../components/icons/ExclamationTriangleIcon";
import InformationIcon from "../../components/icons/InformationIcon";
import MagnifyingGlassIcon from "../../components/icons/MagnifyingGlassIcon";
import PencilSquareIcon from "../../components/icons/PencilSquareIcon";
import TrashIcon from "../../components/icons/TrashIcon";
import XMarkIcon from "../../components/icons/XMarkIcon";
import { env } from "../../env/server.mjs";
import { getServerAuthSession } from "../../server/auth";
import { useFormValidation, useLocalStorage } from "../../utils";
import type { RouterInputs } from "../../utils/api";
import { api } from "../../utils/api";

const organizeByParser = z.union([z.literal("name"), z.literal("category")]);

type Exercise = {
  id: string;
  name: string;
  category: string;
  image: string | null;
};

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

  const [newExercise, setNewExercise] = useState<Omit<Exercise, "id">>({
    name: "",
    category: "",
    image: null,
  });

  const newExerciseNameProps = useFormValidation(
    newExercise?.name,
    v => v?.length !== undefined && v.length < 1 && "Nome vazio",
    false,
  );

  const newExerciseCategoryProps = useFormValidation(
    newExercise?.category,
    v => v?.length !== undefined && v.length < 1 && "Categoria vazia",
    false,
  );

  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const [showAddConfirmation, setShowAddConfirmation] = useState(false);

  const addExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setShowExerciseModal(false);
      setShowAddConfirmation(false);
      setNewExercise({ name: "", category: "", image: null });
    },
  });

  const [editedExercise, setEditedExercise] = useState<RouterInputs["exercise"]["update"]>();

  useEffect(() => {
    console.log("editedExercise", editedExercise);
  }, [editedExercise]);

  const editedExerciseNameProps = useFormValidation(
    editedExercise?.name,
    v => v?.length !== undefined && v.length < 1 && "Nome vazio",
    false,
  );

  const editedExerciseCategoryProps = useFormValidation(
    editedExercise?.category,
    v => v?.length !== undefined && v.length < 1 && "Categoria vazia",
    false,
  );

  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  const editExercise = api.exercise.update.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setEditedExercise(undefined);
      setShowExerciseModal(false);
    },
  });

  const [toBeRemoved, setToBeRemoved] = useState<Omit<Exercise, "category" | "image">>();

  const removeExercise = api.exercise.delete.useMutation({
    onSuccess: () => {
      setToBeRemoved(undefined);
      void groups.refetch();
    },
  });

  const [showImageModal, setShowImageModal] = useState<Omit<Exercise, "category" | "image">>();

  const selectedExerciseImage = api.exercise.getExerciseImageById.useQuery(
    { id: showImageModal?.id ?? "" },
    { enabled: showImageModal !== undefined },
  );

  const editedExerciseImage = api.exercise.getExerciseImageById.useQuery(
    { id: editedExercise?.id ?? "" },
    { enabled: editedExercise !== undefined },
  );

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
          <div className="relative flex flex-col items-center justify-center">
            <ImageInput
              className="h-72 w-72 rounded-md bg-slate-200 text-slate-800"
              imageUrl={newExercise.image}
              onChange={image => setNewExercise({ ...newExercise, image })}
            />
            <div className="h-4 w-4" />
            {newExercise.image !== undefined && (
              <div className="absolute bottom-0 flex h-8 w-full justify-center">
                <button
                  className="h-8 w-8"
                  onClick={() => setNewExercise({ ...newExercise, image: null })}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-red-500">
                    <XMarkIcon className="h-4 w-4 text-white" />
                  </div>
                </button>
              </div>
            )}
          </div>
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
      {newExercise && showAddConfirmation && (
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

      {showImageModal && (
        <Modal
          onClickOutside={() => setShowImageModal(undefined)}
          buttons={
            <button
              onClick={() => setShowImageModal(undefined)}
              className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fechar
            </button>
          }
        >
          <h1 className="self-center font-medium">{showImageModal.name}</h1>
          {selectedExerciseImage.isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
            </div>
          ) : selectedExerciseImage.data ? (
            <div className="relative h-72 w-72">
              <Image
                src={selectedExerciseImage.data}
                alt="imagem do exercicio"
                className="h-full w-full rounded-md object-cover"
                fill
              />
            </div>
          ) : (
            <h1>Não há imagem para esse exercício.</h1>
          )}
        </Modal>
      )}

      {editedExercise && (
        <Modal
          onClickOutside={() => setEditedExercise(undefined)}
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
                onClick={() => setEditedExercise(undefined)}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="self-center font-medium">Editar exercício</h1>
          <div className="relative flex flex-col items-center justify-center">
            {editedExerciseImage.isLoading ? (
              <div className="flex h-72 w-72 items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              editedExerciseImage.isSuccess && (
                <ImageInput
                  className="h-72 w-72 rounded-md bg-slate-200 text-slate-800"
                  imageUrl={
                    editedExercise.image === undefined
                      ? editedExerciseImage.data
                      : editedExercise.image
                  }
                  onChange={image => setEditedExercise({ ...editedExercise, image })}
                />
              )
            )}
            <div className="h-4 w-4" />
            <div className="absolute bottom-0 flex h-8 w-full justify-around">
              {editedExercise.image !== null && (
                <button
                  className="h-8 w-8"
                  onClick={() => setEditedExercise({ ...editedExercise, image: null })}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-red-500">
                    <XMarkIcon className="h-4 w-4 text-white" />
                  </div>
                </button>
              )}
              {editedExercise.image !== undefined && (
                <button
                  className="h-8 w-8"
                  onClick={() => setEditedExercise({ ...editedExercise, image: undefined })}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500">
                    <ArrowUturnLeftIcon className="h-4 w-4 text-white" />
                  </div>
                </button>
              )}
            </div>
          </div>
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
      {editedExercise && showEditConfirmation && (
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
          onClickOutside={() => setToBeRemoved(undefined)}
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
              onClick={() => setToBeRemoved(undefined)}
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
                        handleInfo={e => () => setShowImageModal(e)}
                      />
                    ))
                  : filteredExercises?.map(exercise => (
                      <ExerciseCard
                        {...exercise}
                        key={exercise.id}
                        showCategory
                        handleRemoveExercise={e => () => setToBeRemoved(e)}
                        handleEditExercise={e => () => setEditedExercise(e)}
                        handleInfo={e => () => setShowImageModal(e)}
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
  handleInfo,
}: {
  id: string;
  name: string;
  category: string;
  showCategory?: boolean;
  handleRemoveExercise: (e: Omit<Exercise, "category" | "image">) => () => void;
  handleEditExercise: (e: RouterInputs["exercise"]["update"]) => () => void;
  handleInfo: (e: Omit<Exercise, "category" | "image">) => () => void;
}) => {
  return (
    <div className="flex max-w-[calc(100vw_-_2rem)] flex-1 flex-row items-center justify-between rounded-md bg-blue-500">
      <button onClick={handleInfo({ id, name })} className="ml-3">
        <InformationIcon className="h-6 w-6 text-gold-500" />
      </button>
      <div className="flex w-full flex-col justify-between truncate px-3 py-2">
        <div className="text-md truncate text-white">{name}</div>
        {showCategory && <div className="truncate text-sm text-slate-100">{category}</div>}
      </div>
      <button
        onClick={handleEditExercise({ id, name, category, image: undefined })}
        className="mr-3 rounded-full p-1.5 text-gold-500 transition-colors hover:bg-gold-600 hover:text-white"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>
      <div className="relative flex h-full items-center justify-center gap-1.5 rounded-r-md bg-blue-400 p-1 pl-1.5 transition-colors hover:bg-blue-500">
        <button
          onClick={handleRemoveExercise({ id, name })}
          className="rounded-full bg-blue-200 p-1.5 text-red-500 shadow-md transition-colors hover:bg-red-500 hover:text-white"
        >
          <TrashIcon className="h-5 w-5" />
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
  handleInfo,
}: {
  category: string;
  exercises: Omit<Exercise, "image">[];
  handleRemoveExercise: (e: Omit<Exercise, "category" | "image">) => () => void;
  handleEditExercise: (e: RouterInputs["exercise"]["update"]) => () => void;
  handleInfo: (e: Omit<Exercise, "category" | "image">) => () => void;
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
            handleInfo={handleInfo}
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
