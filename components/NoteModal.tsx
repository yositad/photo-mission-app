import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity } from 'react-native';

type NoteModalProps = {
    visible: boolean;
    initialNote?: string;
    onClose: () => void;
    onSave: (note: string) => void;
};

export const NoteModal: React.FC<NoteModalProps> = ({ visible, initialNote, onClose, onSave }) => {
    const [note, setNote] = useState(initialNote || '');

    useEffect(() => {
        setNote(initialNote || '');
    }, [initialNote, visible]);

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Note</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setNote}
                        value={note}
                        placeholder="Enter note here..."
                        multiline
                        numberOfLines={4}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                            <Text style={styles.textStyle}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
                            <Text style={styles.textStyle}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    buttonSave: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#007AFF',
        minWidth: 80,
        alignItems: 'center',
    },
    buttonCancel: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#FF3B30',
        minWidth: 80,
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
