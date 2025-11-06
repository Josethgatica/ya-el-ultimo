import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const FormularioCliente = ({ cargarDatos }) => {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");

    const guardarCliente = async () => {
        if (nombre && apellido) {
            try {
                await addDoc(collection(db, "clientes"), {
                    nombre: nombre,
                    apellido: apellido,
                });
                setNombre("");
                setApellido("");
                cargarDatos(); // Volver a cargar la lista
            } catch (error) {
                console.error("Error al registrar un cliente:", error);
            }
        } else {
            alert("Por favor, complete todos los campos.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Registro de Clientes</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre del cliente"
                value={nombre}
                onChangeText={setNombre}
            />
            <TextInput
                style={styles.input}
                placeholder="Apllido del cliente"
                value={apellido}
                onChangeText={setApellido}
            />
            <Button title="Guardar" onPress={guardarCliente} />
        </View>
    );

};

const styles = StyleSheet.create({
    container: { padding: 20 },
    titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#25c510ff", padding: 10, marginBottom: 10 }
});

export default FormularioCliente;