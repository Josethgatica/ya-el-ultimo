// src/Screens/Productos.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { db } from "../database/firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";

import FormularioProductos from "../Components/FormularioProductos.js";
import TablaProductos from "../Components/TablaProductos.js";

// === DEPENDENCIAS PARA EXCEL ===
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

const Productos = ({ cerrarSesion }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
  });

  // === MANEJO DE PRODUCTOS ===
  const manejoCambio = (nombre, valor) => {
    setNuevoProducto((prev) => ({ ...prev, [nombre]: valor }));
  };

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      Alert.alert("Error", "Complete todos los campos.");
      return;
    }
    await addDoc(collection(db, "productos"), {
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
    });
    setNuevoProducto({ nombre: "", precio: "" });
    cargarDatos();
  };

  const actualizarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      Alert.alert("Error", "Complete todos los campos.");
      return;
    }
    await updateDoc(doc(db, "productos", productoId), {
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
    });
    setNuevoProducto({ nombre: "", precio: "" });
    setModoEdicion(false);
    setProductoId(null);
    cargarDatos();
  };

  const cargarDatos = async () => {
    const querySnapshot = await getDocs(collection(db, "productos"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProductos(data);
  };

  const eliminarProducto = async (id) => {
    await deleteDoc(doc(db, "productos", id));
    cargarDatos();
  };

  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
    });
    setProductoId(producto.id);
    setModoEdicion(true);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ========================================
  // FUNCIÓN: IMPORTAR MASCOTAS
  // ========================================
  const extraerYGuardarMascotas = async () => {
    await importarExcel("mascotas", ["nombre", "edad", "raza"], (row) => ({
      nombre: row.nombre?.toString().trim() || "Sin nombre",
      edad: parseInt(row.edad) || 0,
      raza: row.raza?.toString().trim() || "Sin raza",
    }));
  };

  // ========================================
  // FUNCIÓN: IMPORTAR BICICLETAS
  // ========================================
  const extraerYGuardarBicicletas = async () => {
    await importarExcel("bicicletas", ["marca", "modelo", "precio", "color"], (row) => ({
      marca: row.marca?.toString().trim() || "Sin marca",
      modelo: row.modelo?.toString().trim() || "Sin modelo",
      precio: parseFloat(row.precio) || 0,
      color: row.color?.toString().trim() || "Sin color",
    }));
  };

  // ========================================
  // FUNCIÓN GENÉRICA: IMPORTAR EXCEL
  // ========================================
  const importarExcel = async (coleccion, columnasEsperadas, mapearFila) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        Alert.alert("Cancelado", "No se seleccionó archivo.");
        return;
      }

      const { uri, name } = result.assets[0];

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(
        "https://thzg0v3rj9.execute-api.us-east-1.amazonaws.com/extraerexcel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archivoBase64: base64 }),
        }
      );

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const { datos } = await response.json();

      if (!Array.isArray(datos) || datos.length === 0) {
        Alert.alert("Error", "El Excel está vacío o no tiene datos.");
        return;
      }

      let guardados = 0;
      let errores = 0;

      for (const fila of datos) {
        try {
          const datosMapeados = mapearFila(fila);
          await addDoc(collection(db, coleccion), {
            ...datosMapeados,
            fechaImportacion: new Date(),
          });
          guardados++;
        } catch (err) {
          errores++;
          console.error("Error guardando fila:", fila, err);
        }
      }

      Alert.alert(
        "Importación Completada",
        `${guardados} registros guardados en '${coleccion}'.\nErrores: ${errores}`
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Falló la importación.");
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <ScrollView style={styles.container}>
      <Button title="Cerrar Sesión" onPress={cerrarSesion} color="#dc3545" />

      {/* === BOTONES DE IMPORTACIÓN === */}
      <View style={styles.importSection}>
        <Text style={styles.tituloImport}>Importar desde Excel</Text>

        <Button
          title="Importar Mascotas"
          onPress={extraerYGuardarMascotas}
          color="#28a745"
        />
        <View style={{ marginVertical: 5 }} />

        <Button
          title="Importar Bicicletas"
          onPress={extraerYGuardarBicicletas}
          color="#007bff"
        />
      </View>

      {/* === FORMULARIO PRODUCTOS === */}
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
      />

      {/* === TABLA PRODUCTOS === */}
      <TablaProductos
        productos={productos}
        editarProducto={editarProducto}
        eliminarProducto={eliminarProducto}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8f9fa" },
  importSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 15,
    elevation: 3,
  },
  tituloImport: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#343a40",
  },
});

export default Productos;