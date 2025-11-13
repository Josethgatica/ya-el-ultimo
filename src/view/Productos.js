import React, { useEffect, useState } from "react";
import { db } from "../database/firebaseConfig.js";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import FormularioProductos from "../Components/FormularioProductos.js";
import TablaProductos from "../Components/TablaProductos.js";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { View, StyleSheet, Button, Alert } from "react-native";


const Productos = ({cerrarSesion}) => {

  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);

  const [productos, setProductos] = useState([]);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
  });

  const manejoCambio = (nombre, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const guardarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {
        await addDoc(collection(db, "productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        cargarDatos(); // Recargar lista
        setNuevoProducto({ nombre: "", precio: "" });
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al registrar producto:", error);
    }
  };

  const actualizarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {
        await updateDoc(doc(db, "productos", productoId), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        setNuevoProducto({ nombre: "", precio: "" });
        setModoEdicion(false); // Volver al modo registro
        setProductoId(null);
        cargarDatos(); // Recargar lista
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      cargarDatos(); // Recargar lista
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
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

  const extraerYGuardarMascotas = async () => {
  try {
    // Abrir selector de documentos para elegir archivo Excel
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert("Cancelado", "No se seleccionó ningún archivo.");
      return;
    }

    const { uri, name } = result.assets[0];
    console.log(`Archivo seleccionado: ${name} en ${uri}`);

    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Enviar a Lambda para procesar
    const response = await fetch("https://thzg0v3rj9.execute-api.us-east-1.amazonaws.com/extraerexcel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archivoBase64: base64 }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP en Lambda: ${response.status}`);
    }

    const body = await response.json();
    const { datos } = body;

    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      Alert.alert("Error", "No se encontraron datos en el Excel o el archivo está vacío.");
      return;
    }

    console.log("Datos extraídos del Excel:", datos);

    // Guardar cada fila en la colección 'mascotas'
    let guardados = 0;
    let errores = 0;

    for (const mascota of datos) {
      try {
        // Columnas: 'nombre', 'edad', 'raza' (ajusta si los headers son diferentes)
        await addDoc(collection(db, "mascotas"), {
          nombre: mascota.nombre || "",
          edad: parseInt(mascota.edad) || 0,
          raza: mascota.raza || "",
        });
        guardados++;
      } catch (err) {
        console.error("Error guardando mascota:", mascota, err);
        errores++;
      }
    }

    Alert.alert(
      "Éxito",
      `Se guardaron ${guardados} mascotas en la colección. Errores: ${errores}.`,
      [{ text: "OK" }]
    );

  } catch (error) {
    console.error("Error en extraerYGuardarMascotas:", error);
    Alert.alert("Error", `Error procesando el Excel: ${error.message}`);
  }
};

  return (
    <View style={styles.container}>

      <Button  title="Cerrar Sesión" onPress={cerrarSesion} />
      <Button  title="Importar Mascotas desde Excel" onPress={extraerYGuardarMascotas} />
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
      />
      
      <TablaProductos 
        productos={productos}
        editarProducto={editarProducto} 
        eliminarProducto={eliminarProducto}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;