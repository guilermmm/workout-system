/* eslint-disable jsx-a11y/alt-text */

import type {
  Exercise as DbExercise,
  Workout as DbWorkout,
  ExerciseInWorkout,
  Profile,
  User,
} from "@prisma/client";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { join } from ".";
import { methodTranslation, weekdaysTranslation } from "./consts";
import type { ParseJsonValues } from "./types";

type Workout = ParseJsonValues<
  DbWorkout & { exercises: (ExerciseInWorkout & { exercise: DbExercise })[] }
>;

type Exercise = Workout["exercises"][number];

type ExerciseGroup = { id: string; exercises: readonly [Exercise, Exercise] };

type Sets = (
  | {
      time: number;
      weight: number;
      reps: undefined;
    }
  | {
      time: undefined;
      weight: number;
      reps: number;
    }
)[];

export const PDFViewerWithNoSSR = dynamic(
  async () => (await import("@react-pdf/renderer")).PDFViewer,
  {
    ssr: false,
  },
);

Font.register({
  family: "Inter",
  fonts: [
    {
      fontWeight: 100,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 200,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 300,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 400,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 500,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 600,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 700,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 800,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 900,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
    },
  ],
});

const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "100%",
  },
  page: {
    fontFamily: "Inter",
    backgroundColor: "#ffffff",
    color: "#000000",
    display: "flex",
    flexDirection: "column",
    padding: 32,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 100,
  },
  logoContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  blueText: {
    color: "#2563eb",
  },
});

// const MeasurementCard = ({ title }: { title: string }) => (
//   <View
//     style={{
//       width: "100%",
//       height: "100%",
//       borderWidth: 1,
//       padding: 8,
//     }}
//   >
//     <Text>{title}</Text>
//   </View>
// );

type Props = {
  profile: (Profile & { user: User | null }) | null;
  workouts: Workout[];
};

// Create Document Component
function BasicDocument(props: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 16 }}>
          <View style={styles.logoContainer}>
            <Image src="/logo1.png" style={styles.logo} />
            <Image src="/logo2.png" style={styles.logo} />
          </View>
          <View style={styles.title}>
            <Text style={styles.blueText}>FICHA DE TREINO</Text>
            <Text style={{ fontSize: 20, fontWeight: 500 }}>|</Text>
            <Text>IDMFit</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Text style={{ textAlign: "center" }}>
              {props.profile?.user && props.profile.user.name}
            </Text>
            <Text style={{ textAlign: "center", fontSize: 14 }}>{props.profile?.email}</Text>
          </View>
        </View>
        {/* <View
          style={{
            paddingHorizontal: 16,
            color: "#2563eb",
            fontSize: 14,
          }}
        >
          <Text style={{ backgroundColor: "#ffd700", padding: 8 }}>Medidas:</Text>
        </View>
        <View
          style={{
            fontSize: 12,
            padding: 16,
            width: "100%",
            gap: 8,
            flexGrow: 1,
          }}
        >
          {datasheetLayout.map(([left, right], i) => (
            <View
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 8,
                flexGrow: 1,
              }}
            >
              <MeasurementCard title={dataSheetTranslation[left]} />
              <MeasurementCard title={dataSheetTranslation[right]} />
            </View>
          ))}
        </View> */}
        <View
          style={{
            padding: 8,
            gap: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          {props.workouts.map((workout, i) => (
            <WorkoutCard key={i} workout={workout} />
          ))}
        </View>
      </Page>
    </Document>
  );
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const exerciseGroups = workout?.exercises.reduce((acc, exercise) => {
    const isAlreadyInAGroup = acc.find(
      g => "exercises" in g && g.exercises.find(e => e.id === exercise.id),
    );
    if (isAlreadyInAGroup) {
      return acc;
    }

    if (workout.biSets.some(([, b]) => b === exercise.id)) {
      return acc;
    }

    const biSet = workout.biSets.find(([a]) => a === exercise.id);
    if (biSet) {
      const [, b] = biSet;
      const group = [exercise, workout.exercises.find(e => e.id === b)!] as const;

      return [...acc, { id: exercise.id, exercises: group }];
    }

    return [...acc, exercise];
  }, [] as (ExerciseGroup | Exercise)[]);

  const categories = workout.exercises.reduce((acc, exercise) => {
    if (acc.includes(exercise.exercise.category)) {
      return acc;
    }

    acc.push(exercise.exercise.category);
    return acc;
  }, [] as string[]);

  return (
    <View
      wrap={false}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 12,
      }}
    >
      <View
        style={{
          backgroundColor: "#ffd700",
          padding: 8,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Text style={{ color: "#2563eb" }}>
          Treino
          <Text style={{ fontWeight: 700 }}> {workout.name}</Text> - {join(categories)}
        </Text>
        <Text style={{ color: "#2563eb", fontWeight: 600 }}>
          {join(workout.days.map(w => weekdaysTranslation[w]))}
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <View
          style={{
            paddingVertical: 8,
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#2563eb",
            color: "#ffffff",
          }}
        >
          <View style={{ display: "flex", alignItems: "center", width: "20%" }}>
            <Text>Exercício</Text>
          </View>
          <View style={{ display: "flex", alignItems: "center", width: "20%" }}>
            <Text style={{ textAlign: "center" }}>Séries</Text>
          </View>
          <View style={{ display: "flex", alignItems: "center", width: "20%" }}>
            <Text>Peso</Text>
          </View>
          <View style={{ display: "flex", alignItems: "center", width: "20%" }}>
            <Text>Descrição</Text>
          </View>
          <View style={{ display: "flex", alignItems: "center", width: "20%" }}>
            <Text>Método</Text>
          </View>
        </View>
        {exerciseGroups.map((group, i) => {
          if ("exercises" in group) {
            const [first, second] = group.exercises;
            return (
              <View key={i} style={{ backgroundColor: i % 2 === 0 ? "#eff6ff" : "#dbeafe" }}>
                <BiSetCard first={first} second={second} />
              </View>
            );
          }

          return (
            <View key={i} style={{ backgroundColor: i % 2 === 0 ? "#eff6ff" : "#dbeafe" }}>
              <ExerciseCard exercise={group} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const groups = (exercise.sets as Sets).reduce((acc, set) => {
    const last = acc.at(-1);

    if (
      (last?.set.reps === set.reps || last?.set.time === set.time) &&
      last?.set.weight === set.weight
    ) {
      last.quantity++;
      return acc;
    }

    acc.push({ quantity: 1, set });
    return acc;
  }, [] as { quantity: number; set: Sets[number] }[]);

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        paddingVertical: 8,
        textAlign: "center",
        width: "100%",
        fontSize: 10,
      }}
    >
      <View
        style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Text>{exercise.exercise.name}</Text>
      </View>

      <View
        style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {groups.map(({ quantity, set }, i) => (
          <Text key={i}>
            {quantity}
            {" x "}
            {set.reps
              ? set.reps
              : `${set.time! > 60 ? `${Math.floor(set.time! / 60)}min` : ""}${
                  set.time! % 60 > 0 ? `${set.time! % 60}s` : ""
                }`}
          </Text>
        ))}
      </View>
      <View
        style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {groups.map(({ set }, i) => (
          <Text key={i}>{set.weight / 1000}kg</Text>
        ))}
      </View>

      <View
        style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Text>{exercise.description}</Text>
      </View>
      <View
        style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Text>{methodTranslation[exercise.method]}</Text>
      </View>
    </View>
  );
}

function BiSetCard({ first, second }: { first: Exercise; second: Exercise }) {
  return (
    <View style={{ display: "flex", flexDirection: "column", borderWidth: 1 }}>
      <ExerciseCard exercise={first} />
      <ExerciseCard exercise={second} />
    </View>
  );
}

// export const profilePDF: Profile & { user: User } = {
//   id: "1",
//   email: "johndoe@gmail.com",
//   user: {
//     id: "1",
//     name: "John Doe",
//     email: "johndoe@gmail.com",
//     emailVerified: null,
//     image:
//       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Petersen_graph_3-coloring.svg/1200px-Petersen_graph_3-coloring.svg.png",
//   },
//   isActive: true,
//   createdAt: new Date(),
//   updatedAt: new Date(),
//   userId: "1",
// };

// export const workoutsPDF: ParseJsonValues<
//   Workout & { exercises: (ExerciseInWorkout & { exercise: DbExercise })[] }
// >[] = [
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "1",
//     profileId: "1",
//     name: "A",
//     days: ["Monday", "Wednesday", "Friday"],
//     exercises: [
//       {
//         id: "1",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "1",
//           name: "Supino Reto",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "1",
//         index: 0,
//         method: "Standard",
//         sets: [
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//           { reps: 8, weight: 6000 },
//         ],
//       },
//       {
//         id: "2",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "estore o curso natural do movimento",
//         exercise: {
//           id: "2",
//           name: "Supino Inclinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "2",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 8000 },
//           { reps: 10, weight: 6000 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Standard",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//       {
//         id: "3",
//         workoutId: "1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         description: "",
//         exercise: {
//           id: "3",
//           name: "Supino Declinado do zap",
//           category: "Peitoral",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           image: null,
//         },
//         exerciseId: "3",
//         index: 1,
//         method: "Pyramid",
//         sets: [
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 4000 },
//           { time: 90, weight: 0 },
//         ],
//       },
//     ],
//     biSets: [["1", "2"]],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
// ];

export default BasicDocument;
