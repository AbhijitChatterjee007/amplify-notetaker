import "@aws-amplify/ui/dist/style.css";
import { withAuthenticator } from "aws-amplify-react";
import { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

function App() {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState();
  const [isUpdate, setIsUpdate] = useState(false);
  const [id, setId] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await API.graphql(
        graphqlOperation(createNote, { input: { note } })
      );
      const data = result.data.createNote;
      const updatedNotes = [data, ...notes];
      setNotes(updatedNotes);
      setNote("");
    } catch (e) {
      console.log(e);
    }
  };

  const handleChange = (e) => {
    setNote(e.target.value);
  };

  useEffect(() => {
    const getNotes = async () => {
      try {
        const data = await API.graphql(graphqlOperation(listNotes));
        const items = data.data.listNotes.items.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotes(items);
      } catch (e) {
        console.log(e);
      }
    };

    getNotes();
  }, []);

  const handleDelete = async (id) => {
    try {
      const data = await API.graphql(
        graphqlOperation(deleteNote, { input: { id } })
      );
      const updatedNotes = notes
        ?.filter((n) => n.id !== data?.data?.deleteNote.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };

  const setUpdateAttributes = (item) => {
    setNote(item.note);
    setId(item.id);
    setIsUpdate(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const input = { id, note };
    try {
      const result = await API.graphql(graphqlOperation(updateNote, { input }));
      const updatedNote = result.data.updateNote;
      let updatedNotes = [];
      notes.filter((note) => note.id === id).forEach((note) => updatedNote);
      notes.forEach((note) => {
        note.id === id ? updatedNotes.push(updatedNote) : updatedNotes.push(note);
      });
      setNotes(updatedNotes)
      setNote("");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-1">Amplify Notetaker</h1>

      <form
        action="post"
        onSubmit={isUpdate ? handleUpdate : handleSubmit}
        className="mb3"
      >
        <input
          type="text"
          className="pa2 f4"
          placeholder="Write your note"
          onChange={handleChange}
          value={note}
        />
        <button className="pa2 f4" type="submit">
          {isUpdate ? "Update" : "Add Item"}
        </button>
      </form>

      {notes?.map((i) => {
        return (
          <div className="flex items-center" key={i.id}>
            <li className="list pa1 f3" onClick={() => setUpdateAttributes(i)}>
              {i.note}
            </li>
            <button
              className="bg-transparent bn f4"
              onClick={() => {
                handleDelete(i.id);
              }}
            >
              <span>&times;</span>
            </button>
            <br></br>
          </div>
        );
      })}
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
