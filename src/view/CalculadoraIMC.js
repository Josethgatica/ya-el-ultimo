// src/view/CalculadoraIMC.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { realtimeDB } from "../database/firebaseConfig";
import {
  ref,
  push,
  set,
  onValue,
} from "firebase/database";

const CalculadoraIMC = () => {
  const [nombre, setNombre] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  const registrosRef = ref(realtimeDB, "imc_registros");

  const calcularIMC = () => {
    const p = parseFloat(peso);
    const a = parseFloat(altura) / 100; // cm a metros

    if (!nombre || !p || !a || a <= 0) {
      Alert.alert("Error", "Complete todos los campos correctamente");
      return;
    }

    const imc = (p / (a * a)).toFixed(2);
    let clasificacion = "";
    let color = "";

    if (imc < 18.5) {
      clasificacion = "Bajo peso";
      color = "#3498db";
    } else if (imc < 25) {
      clasificacion = "Peso normal";
      color = "#27ae60";
    } else if (imc < 30) {
      clasificacion = "Sobrepeso";
      color = "#f39c12";
    } else {
      clasificacion = "Obesidad";
      color = "#e74c3c";
    }

    const nuevoRegistro = {
      nombre,
      peso: p,
      altura: parseFloat(altura),
      imc: parseFloat(imc),
      clasificacion,
      fecha: new Date().toLocaleString("es-CR"),
    };

    const nuevoRef = push(registrosRef);
    set(nuevoRef, nuevoRegistro)
      .then(() => {
        Alert.alert("Éxito", `IMC: ${imc} → ${clasificacion}`);
        limpiar();
      })
      .catch(() => Alert.alert("Error", "No se pudo guardar"));
  };

  const limpiar = () => {
    setNombre("");
    setPeso("");
    setAltura("");
  };

  useEffect(() => {
    const unsubscribe = onValue(registrosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data)
          .map(([id, valor]) => ({ id, ...valor }))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // más recientes primero
        setRegistros(lista);
      } else {
        setRegistros([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Calculadora de IMC + Historial en Tiempo Real</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Peso (kg)"
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Altura (cm)"
          value={altura}
          onChangeText={setAltura}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.btnCalcular} onPress={calcularIMC}>
          <Text style={styles.btnText}>Calcular IMC y Guardar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Historial en Tiempo Real</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : registros.length === 0 ? (
        <Text style={styles.empty}>Aún no hay registros. ¡Sé el primero!</Text>
      ) : (
        registros.map((r) => (
          <View key={r.id} style={styles.registro}>
            <View style={styles.registroHeader}>
              <Text style={styles.nombre}>{r.nombre}</Text>
              <Text style={styles.fecha}>{r.fecha}</Text>
            </View>
            <Text>Peso: {r.peso} kg | Altura: {r.altura} cm</Text>
            <Text style={[styles.imc, { color: r.clasificacion.includes("normal") ? "#27ae60" : r.clasificacion.includes("Bajo") ? "#3498db" : "#e74c3c" }]}>
              IMC: {r.imc} → {r.clasificacion}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.footer}>
        Abre esta app en otro celular → verás los nuevos cálculos al instante
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f8ff" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginVertical: 20, color: "#2c3e50" },
  form: { backgroundColor: "white", padding: 20, borderRadius: 15, elevation: 5, marginBottom: 25 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  btnCalcular: { backgroundColor: "#9b59b6", padding: 18, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white", fontWeight: "bold", fontSize: 18 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginVertical: 15, color: "#2c3e50" },
  registro: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#9b59b6",
  },
  registroHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  nombre: { fontWeight: "bold", fontSize: 16 },
  fecha: { color: "#7f8c8d", fontSize: 12 },
  imc: { fontWeight: "bold", fontSize: 16, marginTop: 5 },
  empty: { textAlign: "center", color: "#95a5a6", fontStyle: "italic", marginTop: 20 },
  footer: { textAlign: "center", marginVertical: 30, color: "#7f8c8d", fontStyle: "italic", fontSize: 14 },
});

export default CalculadoraIMC;