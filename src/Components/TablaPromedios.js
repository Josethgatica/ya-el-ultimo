import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import BotonEliminarPromedio from './BotonEliminarPromedio';

const TablaPromedio = ({ promedio, eliminarPromedio }) => {

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Tabla de Promedio</Text>

            <View style={[styles.fila, styles.encabezado]}>
                <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Edad</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
            </View>

            {/* Lista de promedio */}
            <ScrollView>
                {(!promedio || promedio.length === 0) ? (
                    <View style={styles.fila}>
                        <Text style={styles.celda}>No hay registros</Text>
                    </View>
                ) : (
                    (promedio || []).map((item) => (
                        <View key={item.id} style={styles.fila}>
                            <Text style={styles.celda}>{item.nombre}</Text>
                            <Text style={styles.celda}>{item.edad}</Text>
                            <View style={styles.celdaAcciones}>
                                <BotonEliminarPromedio
                                    id={item.id} eliminarPromedio={eliminarPromedio}
                                />
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignSelf: "stretch"
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10
    },
    fila: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 6,
        alignItems: "center"
    },
    encabezado: {
        backgroundColor: "#d48d7bff"
    },
    celda: {
        flex: 1,
        fontSize: 16,
        textAlign: "center"
    },
    celdaAcciones: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    textoEncabezado: {
        fontWeight: "bold",
        fontSize: 17,
        textAlign: "center"
    }
});

export default TablaPromedio;