import React, { useState, useEffect } from "react";
import "../styles/Report.css";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as Del } from "../img/del.svg";
import { db } from "./firebase.js";
import {
  collection,
  query,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const Report: React.FC = () => {
  interface Report {
    id?: string;
    date: string;
    transaction: string;
    debit: number;
    credit: number;
    currency: string;
    exchangeRate: number;
    sum: number;
    total: number;
  }

  const location = useLocation();

  const [reportsListId, setReportsListId] = useState<string | null>(null);
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [date, setDate] = useState<string>("");
  const [transaction, setTransaction] = useState<string>("");
  const [debit, setDebit] = useState<string>("");
  const [credit, setCredit] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [summaryTotal, setSummaryTotal] = useState<number>(0);

  const summaryTotalStyle = {
    color: summaryTotal < 0 ? "red" : "black",
  };

  useEffect(() => {
    const fetchReportsListId = async () => {
      const q = query(collection(db, "ReportsList"));
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      if (reports.length > 0) {
        setReportsListId(reports[0].id); // Вибираємо перший документ як приклад
      }
    };

    fetchReportsListId();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!reportsListId) return;

      const q = query(collection(db, `ReportsList/${reportsListId}/Report`));
      const querySnapshot = await getDocs(q);
      const queryData = querySnapshot.docs.map((detail) => ({
        ...detail.data(),
        id: detail.id,
      })) as Report[];

      setReportsList(queryData);
      const totalSum = queryData.reduce((acc, report) => acc + report.sum, 0);
      setSummaryTotal(parseFloat(totalSum.toFixed(2)));
    };

    fetchReports();
  }, [reportsListId]);
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const debitNumber = parseFloat(debit) || 0;
    const creditNumber = parseFloat(credit) || 0;
    const exchangeRateNumber = parseFloat(exchangeRate) || 1;

    const calculatedSum = (creditNumber - debitNumber) / exchangeRateNumber;
    const roundedSum = parseFloat(calculatedSum.toFixed(2));

    const newReport: Report = {
      date,
      transaction,
      debit: debitNumber,
      credit: creditNumber,
      currency,
      exchangeRate: exchangeRateNumber,
      sum: roundedSum,
      total: summaryTotal + roundedSum,
    };

    const q = query(collection(db, "ReportsList"));
    const querySnapshot = await getDocs(q);
    const queryData = querySnapshot.docs.map((detail) => ({
      ...detail.data(),
      id: detail.id,
    }));

    console.log(queryData);

    const addedReports = await Promise.all(
      queryData.map(async (v) => {
        const reportRef = await addDoc(
          collection(db, `ReportsList/${v.id}/Report`),
          newReport
        );
        return { ...newReport, id: reportRef.id };
      })
    );

    setReportsList([...reportsList, ...addedReports]);
    setSummaryTotal((prevTotal) =>
      parseFloat((prevTotal + roundedSum).toFixed(2))
    );

    console.log({
      date,
      transaction,
      debit: debitNumber,
      credit: creditNumber,
      currency,
      exchangeRate: exchangeRateNumber,
      sum: calculatedSum,
      total: summaryTotal + roundedSum,
      summaryTotal: summaryTotal + calculatedSum,
    });

    setDate("");
    setTransaction("");
    setDebit("");
    setCredit("");
    setCurrency("");
    setExchangeRate("");
  };

  const handleDelete = async (id: string) => {
    const itemToDelete = reportsList.find((report) => report.id === id);
    if (!itemToDelete) return;

    const roundedSum = parseFloat(itemToDelete.sum.toFixed(2));

    const q = query(collection(db, "ReportsList"));
    const querySnapshot = await getDocs(q);
    const queryData = querySnapshot.docs.map((detail) => ({
      ...detail.data(),
      id: detail.id,
    }));

    await Promise.all(
      queryData.map(async (v) => {
        if (itemToDelete.id) {
          await deleteDoc(
            doc(db, `ReportsList/${v.id}/Report/${itemToDelete.id}`)
          );
        }
      })
    );

    const updatedReportsList = reportsList.filter((report) => report.id !== id);
    setReportsList(updatedReportsList);
    setSummaryTotal((prevTotal) =>
      parseFloat((prevTotal - roundedSum).toFixed(2))
    );
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

  return (
    <div>
      <header className="report__header">
        <Link to={`/list`} state={{ from: location }} className="back__link">
          ← Back
        </Link>

        <p className="header__sum" style={summaryTotalStyle}>
          {summaryTotal}
        </p>
      </header>
      <main>
        <form className="report__form" onSubmit={handleSubmit}>
          <label className="report__name">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="report__input"
              autoComplete="off"
            />
          </label>
          <label className="report__name">
            Transaction
            <input
              type="text"
              value={transaction}
              onChange={(e) => setTransaction(e.target.value)}
              className="report__input"
              autoComplete="off"
            />
          </label>
          <label className="report__name">
            Debit
            <input
              type="text"
              value={debit}
              onChange={(e) => setDebit(e.target.value)}
              className="report__input"
              autoComplete="off"
            />
          </label>
          <label className="report__name">
            Credit
            <input
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              className="report__input"
              autoComplete="off"
            />
          </label>
          <label className="report__name">
            Currency
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="report__input"
              autoComplete="off"
            />
          </label>
          <label className="report__name">
            Exchange Rate
            <input
              type="text"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="report__input"
              autoComplete="off"
            />
          </label>

          <button type="submit" className="report__btn">
            Add
          </button>
        </form>
        <ul className="chart">
          <li className="chart__row">
            <ul className="chart__list">
              <li className="chart__name">Date</li>
              <li className="chart__name">Transaction</li>
              <li className="chart__name">Currency</li>
              <li className="chart__name">ExchangeRate</li>
              <li className="chart__name">Debit</li>
              <li className="chart__name">Credit</li>
              <li className="chart__name">Sum</li>
              <li className="chart__name">Total</li>
              <Del className="chart__icon" />
            </ul>
          </li>
          {reportsList.map((el) => (
            <li key={el.id} className="chart__row">
              <ul className="chart__list">
                <li className="chart__item">{el.date}</li>
                <li className="chart__item">{el.transaction}</li>
                <li className="chart__item">{el.currency}</li>
                <li className="chart__item">{el.exchangeRate}</li>
                <li className="chart__item">{el.debit}</li>
                <li className="chart__item">{el.credit}</li>
                <li className="chart__item">{el.sum}</li>
                <li className="chart__item">{el.total}</li>
                <Del
                  className="chart__icon"
                  onClick={() => confirmDelete(el.id!)}
                />
              </ul>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export { Report };
