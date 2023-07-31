/* eslint-disable jsx-a11y/alt-text */
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { join } from ".";
import type { RouterOutputs } from "./api";
import { methodTranslation, weekdaysTranslation } from "./consts";

type Profile = RouterOutputs["user"]["getProfileById"];

type Workout = RouterOutputs["workout"]["getManyWithExercises"][number];

type Exercise = Workout["exercises"][number];

type ExerciseGroup = { id: string; exercises: readonly [Exercise, Exercise] };

type Sets = (
  | { time: number; weight: string; reps: undefined }
  | { time: undefined; weight: string; reps: string }
)[];

export const PDFViewerWithNoSSR = dynamic(
  async () => (await import("@react-pdf/renderer")).PDFViewer,
  { ssr: false },
);

Font.register({
  family: "Inter",
  fonts: [
    {
      fontWeight: 400,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 500,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 600,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 700,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
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

type Props = {
  profile: Profile;
  workouts: Workout[];
};

function WorkoutDocument(props: Props) {
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
            {props.profile?.workoutUpdateDate && (
              <Text style={{ textAlign: "center", fontSize: 14 }}>
                Última atualização: {props.profile?.workoutUpdateDate?.toLocaleDateString("pt-BR")}
              </Text>
            )}
          </View>
        </View>
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
            <Text>Observação</Text>
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
          <Text key={i}>{set.weight}</Text>
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

export default WorkoutDocument;
