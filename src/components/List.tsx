import React, { useState, useEffect } from "react";
import "../styles/List.css";
import { Link, useLocation } from "react-router-dom";
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const List: React.FC = () => {
  interface Report {
    name: string;
    id: string;
    date: string;
  }

  const [reportName, setReportName] = useState<string>("");
  const [reportList, setReportList] = useState<Report[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const location = useLocation();

  useEffect(() => {
    const fetchReports = async () => {
      const colRef = collection(db, "ReportsList");
      const snapshot = await getDocs(colRef);
      const reports = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Report)
      );
      setReportList(reports);
    };

    fetchReports();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (reportName.trim() === "") return;

    try {
      const docRef = await addDoc(collection(db, "ReportsList"), {
        name: reportName,
        date: Date(),
      });

      await updateDoc(doc(db, "ReportsList", docRef.id), {
        id: docRef.id,
      });

      console.log("Document written with ID: ", docRef.id);

      setReportList([
        ...reportList,
        { name: reportName, id: docRef.id, date: Date() },
      ]);
      setReportName("");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "ReportsList", id));
      setReportList(reportList.filter((report) => report.id !== id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const confirmDelete = (id: string) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this report?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleDelete(id),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, "ReportsList", id), {
        name: editingName,
      });

      setReportList(
        reportList.map((report) =>
          report.id === id ? { ...report, name: editingName } : report
        )
      );

      setEditingId(null);
      setEditingName("");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  return (
    <div className="list">
      <form className="list__form" onSubmit={handleSubmit}>
        <label className="list__name">
          Report Name
          <input
            type="text"
            className="list__input"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button type="submit" className="list__btn">
          Add
        </button>
      </form>
      <ul className="list__list">
        {reportList.map((item) => (
          <li key={item.id} className="list_item">
            {editingId === item.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  className="list__change__input"
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <div className="btn__list">
                  <button
                    className="btn__list__btn"
                    onClick={() => saveEdit(item.id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn__list__btn sec__btn"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to={`/list/${item.id}`}
                  state={{ from: location }}
                  className="list_link"
                >
                  {item.name}
                </Link>
                <ul className="btn__list">
                  <li className="btn__list__item">
                    <button
                      className="btn__list__btn"
                      onClick={() => handleEdit(item.id, item.name)}
                    >
                      Edit
                    </button>
                  </li>
                  <li className="btn__list__item">
                    <button
                      className="btn__list__btn sec__btn"
                      onClick={() => confirmDelete(item.id)}
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export { List };
