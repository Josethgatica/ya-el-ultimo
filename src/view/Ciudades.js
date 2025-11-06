import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { db } from "../database/firebaseConfig.js";
import { collection, docs, doc, deleteDoc, addDoc, updateDoc, where, query, orderBy, getDocs, limit } from "firebase/firestore";
import FormularioCiudades from "../Components/FormularioCiudades.js";
import TablaCiudades from "../Components/TablaCiudades.js";

const Ciudades = ({ cerrarSesion }) => {
  {/*
  const [modoEdicion, setModoEdicion] = useState(false);
  const [ciudadId, setCiudadId] = useState(null);

  const [ciudades, setCiudades] = useState([]);

  const [nuevaCiudad, setNuevaCiudad] = useState({
    nombre: "",
    pais: "",
    poblacion: "",
    region: "",
  });

  const manejoCambio = (nombre, valor) => {
    setNuevaCiudad((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const guardarCiudad = async () => {
    try {
      if (nuevaCiudad.nombre && nuevaCiudad.pais && nuevaCiudad.poblacion && nuevaCiudad.region) {
        await addDoc(collection(db, "ciudades"), {
          nombre: nuevaCiudad.nombre,
          pais: nuevaCiudad.pais,
          poblacion: parseInt(nuevaCiudad.poblacion, 10),
          region: nuevaCiudad.region,
        });
        cargarDatos();
        setNuevaCiudad({ nombre: "", pais: "", poblacion: "", region: "" });
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al registrar ciudad:", error);
    }
  };

  const actualizarCiudad = async () => {
    try {
      if (nuevaCiudad.nombre && nuevaCiudad.pais && nuevaCiudad.poblacion && nuevaCiudad.region) {
        await updateDoc(doc(db, "ciudades", ciudadId), {
          nombre: nuevaCiudad.nombre,
          pais: nuevaCiudad.pais,
          poblacion: parseInt(nuevaCiudad.poblacion, 10),
          region: nuevaCiudad.region,
        });
        setNuevaCiudad({ nombre: "", pais: "", poblacion: "", region: "" });
        setModoEdicion(false);
        setCiudadId(null);
        cargarDatos();
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al actualizar ciudad:", error);
    }
  };

 const cargarDatos = async () => {
  try {
    const q = query(collection(db, "ciudades"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((docu) => ({
      id: docu.id,
      ...docu.data(),
    }));
    setCiudades(data);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
  }
};

  const eliminarCiudad = async (id) => {
    try {
      await deleteDoc(doc(db, "ciudades", id));
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const editarCiudad = (ciudad) => {
    setNuevaCiudad({
      nombre: ciudad.nombre,
      pais: ciudad.pais,
      poblacion: ciudad.poblacion?.toString?.() ?? "",
      region: ciudad.region ?? "",
    });
    setCiudadId(ciudad.id);
    setModoEdicion(true);
  };
*/}
  useEffect(() => {
    obtenerCiudadesMasPobladas();
    listarHondurasMayor700kNombreAscLimit3();
    obtener2SalvadorPoblacionAsc();
    mostrarCentroamericanasMenorIgual300kPaisDescLimit4();
    obtenerMayor900kOrdenNombre();
    listarGuatemaltecasPoblacionDescLimit();
    obtenerEntre200y600kPaisAscLimit5();
    listarTop5PoblacionRegionDesc();
  }, []);

  async function obtenerCiudadesMasPobladas() {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "Guatemala"),
      orderBy("población", "desc"),
      limit(2)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // Honduras con población > 700k, nombre ascendente, limit 3
  async function listarHondurasMayor700kNombreAscLimit3() {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "Honduras"),
      where("poblacion", ">", 700000),
      orderBy("poblacion"),
      orderBy("nombre", "asc"),
      limit(3)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // 2 ciudades salvadoreñas por población ascendente
  async function obtener2SalvadorPoblacionAsc() {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "El Salvador"),
      orderBy("poblacion", "asc"),
      limit(2)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // Centroamérica con población <= 300k, país descendente, limit 4
  async function mostrarCentroamericanasMenorIgual300kPaisDescLimit4() {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "in", ["Guatemala", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panamá", "Belice"]),
      where("poblacion", "<=", 300000),
      orderBy("poblacion"),
      orderBy("país", "desc"),
      limit(4)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // Población > 900k, ordenadas por nombre
  async function obtenerMayor900kOrdenNombre() {
    const q = query(
      collection(db, "ciudades"),
      where("poblacion", ">", 900000),
      orderBy("poblacion"),
      orderBy("nombre", "asc"),
      limit(3)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // Guatemaltecas por población desc, limit(5)
  async function listarGuatemaltecasPoblacionDescLimit() {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "Guatemala"),
      orderBy("poblacion", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // Población entre 200k y 600k, país ascendente, limit 5
  async function obtenerEntre200y600kPaisAscLimit5() {
    const q = query(
      collection(db, "ciudades"),
      where("poblacion", ">=", 200000),
      where("poblacion", "<=", 600000),
      orderBy("poblacion"),
      orderBy("pais", "asc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }

  // Top 5 por población general, región descendente
  async function listarTop5PoblacionRegionDesc() {
    const q = query(
      collection(db, "ciudades"),
      orderBy("poblacion", "desc"),
      orderBy("region", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => console.log(doc.data().nombre));
  }


  return (

    <View style={styles.container}>
      {/*
      <Button title="Cerrar Sesión" onPress={cerrarSesion} />

      <FormularioCiudades
        nuevaCiudad={nuevaCiudad}
        manejoCambio={manejoCambio}
        guardarCiudad={guardarCiudad}
        actualizarCiudad={actualizarCiudad}
        modoEdicion={modoEdicion}
      />

      <TablaCiudades
        ciudades={ciudades}
        editarCiudad={editarCiudad}
        eliminarCiudad={eliminarCiudad}
      />
    */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Ciudades;


