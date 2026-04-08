import React, { useState, useMemo, useEffect } from "react";
import { ArrowBigLeft, ArrowBigRight, SquarePen, Trash } from 'lucide-react';
import TransactionModal from "./TransactionModal";
import { deleteTransaction } from "../services/api";
import ConfirmDelete from "./ConfirmDelete";
import "../App.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Transactions = ({ transactions, setTransactions }) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const defaultFilters = {
  category: "",
  mode: "",
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate: "",
};

const [filters, setFilters] = useState(defaultFilters);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
}, [search]);

    // ================= PAGINATION =================
const ITEMS_PER_PAGE = 10;
const [currentPage, setCurrentPage] = useState(1);
//Reset Page When Search Changes
useEffect(() => {
  setCurrentPage(1);
}, [search]);

  // ===== FILTER + SORT =====
const processedTransactions = useMemo(() => {
  let result = [...transactions];

  // 1️⃣ NORMAL FILTERS
  result = result.filter((t) => {
    const matchCategory =
      !filters.category || t.category === filters.category;

    const matchMode =
      !filters.mode || t.mode === filters.mode;

    const matchMin =
      !filters.minAmount || t.amount >= Number(filters.minAmount);

    const matchMax =
      !filters.maxAmount || t.amount <= Number(filters.maxAmount);

    const matchStart =
      !filters.startDate ||
      new Date(t.date) >= new Date(filters.startDate);

    const matchEnd =
      !filters.endDate ||
      new Date(t.date) <= new Date(filters.endDate);

    return (
      matchCategory &&
      matchMode &&
      matchMin &&
      matchMax &&
      matchStart &&
      matchEnd
    );
  });

  // 2️⃣ SEARCH FILTER 🔥
  // 2️⃣ SEARCH FILTER
if (debouncedSearch.trim() !== "") {
  const searchLower = debouncedSearch.toLowerCase();

  result = result.filter((t) => {
    const dateObj = new Date(t.date);

    const monthShort = dateObj
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();   // feb

    const monthFull = dateObj
      .toLocaleString("en-US", { month: "long" })
      .toLowerCase();   // february

    const formattedDate = dateObj
      .toLocaleDateString("en-GB")
      .toLowerCase();

    return (
      t.text?.toLowerCase().includes(searchLower) ||
      t.category?.toLowerCase().includes(searchLower) ||
      t.mode?.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower) ||
      String(Math.abs(t.amount)).includes(searchLower) ||
      formattedDate.includes(searchLower) ||
      monthShort.includes(searchLower) ||   // 🔥 Feb
      monthFull.includes(searchLower)       // 🔥 February
    );
  });
}

  // 3️⃣ SORT
  if (!sortOption || sortOption === "date_desc") {
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  if (sortOption === "date_asc") {
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  if (sortOption === "amount_asc") {
    result.sort((a, b) => a.amount - b.amount);
  }

  if (sortOption === "amount_desc") {
    result.sort((a, b) => b.amount - a.amount);
  }

  return result;
}, [transactions, filters, sortOption, debouncedSearch]);

const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;

const totalPages = Math.ceil(
  processedTransactions.length / ITEMS_PER_PAGE
);

const paginatedTransactions =
  processedTransactions.slice(startIndex, endIndex);

useEffect(() => {
  setSelectedIds([]);
}, [currentPage]);

//Add Outside Click Close
useEffect(() => {
  const handleClickOutside = (e) => {
    if (e.target.classList.contains("filter-overlay")) {
      setShowFilter(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () =>
    document.removeEventListener("mousedown", handleClickOutside);
}, []);

//Add Filter Persistence (localStorage)
useEffect(() => {
  const savedFilters = localStorage.getItem("filters");
  const savedSort = localStorage.getItem("sortOption");

  if (savedFilters) setFilters(JSON.parse(savedFilters));
  if (savedSort) setSortOption(savedSort);
}, []);

//Add this SAVE effect:
useEffect(() => {
  localStorage.setItem("filters", JSON.stringify(filters));
  localStorage.setItem("sortOption", sortOption);
}, [filters, sortOption]);


  // ===== Checkbox Logic =====
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async () => {
    for (let id of selectedIds) {
      await deleteTransaction(id);
    }
    setTransactions((prev) =>
      prev.filter((t) => !selectedIds.includes(t._id))
    );
    setSelectedIds([]);
    setShowConfirm(false);
  };

  const handleEditSelected = () => {
    const transaction = transactions.find(
      (t) => t._id === selectedIds[0]
    );
    setEditingData(transaction);
    setShowModal(true);
  };

const activeFilterCount = Object.values(filters).filter(
  (v) => v !== ""
).length + (sortOption ? 1 : 0);

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(processedTransactions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  XLSX.writeFile(workbook, "transactions.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();

  const tableData = processedTransactions.map((t) => [
    t.text,
    t.category,
    t.amount,
    new Date(t.date).toLocaleDateString("en-GB"),
    t.mode,
    t.description,
  ]);

  autoTable(doc, {
    head: [["Name", "Category", "Amount", "Date", "Mode", "Description"]],
    body: tableData,
  });

  doc.save("transactions.pdf");
};

//Add closeFilter function:
const closeFilter = () => {
  setIsClosing(true);
  setTimeout(() => {
    setShowFilter(false);
    setIsClosing(false);
  }, 300);
};

  return (
    <div>
      {/* Header */}
      <div className="transaction-header">
        <h2>All Transactions</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="btn-primary"
            onClick={() => {
              setEditingData(null);
              setShowModal(true);
            }}
          >
            Add Transaction
          </button>

          <button
            className="btn-edit"
            disabled={selectedIds.length !== 1}
            onClick={handleEditSelected}
          >
            <SquarePen/>
          </button>

          <button
            className="btn-delete"
            disabled={selectedIds.length === 0}
            onClick={() => setShowConfirm(true)}
          >
            <Trash/>
          </button>
        </div>
      </div>

      <div className="table-header">
  <h2>Transactions</h2>
  <div className="group-btn-export">
  <button className="btn-export" onClick={exportToExcel}>Export Excel</button>
  <button className="btn-export" onClick={exportToPDF}>Export PDF</button>
  </div>
  <button className="filter-btn" onClick={() => setShowFilter(true)}>
  Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
</button>
</div>

      {/* Table */}
      <table className="transaction-table">
        <thead>
            <tr>
              <th>
                <input
                  type="checkbox"

                  checked={
                    processedTransactions.length > 0 &&
                    selectedIds.length === processedTransactions.length
                  }

                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(processedTransactions.map((t) => t._id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}

                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedIds.length > 0 &&
                        selectedIds.length < processedTransactions.length;
                    }
                  }}

                />
              </th>

              <th>Name</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Payment Mode</th>
              <th>Description</th>
            </tr>
          </thead>
        <tbody>
  {paginatedTransactions.length === 0 ? (
    <tr>
      <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
        No transactions found
      </td>
    </tr>
  ) : (
    paginatedTransactions.map((t) => (
      <tr key={t._id}>
        <td>
          <input
            type="checkbox"
            checked={selectedIds.includes(t._id)}
            onChange={() => toggleSelect(t._id)}
          />
        </td>
        <td>{t.text}</td>
        <td>{t.category}</td>
        <td style={{ color: t.amount > 0 ? "#22c55e" : "#ef4444" }}>
          ₹{t.amount}
        </td>
        <td>
          {t.date ? new Date(t.date).toLocaleDateString() : "-"}
        </td>
        <td>
          <span className={`mode-badge ${t.mode}`}>
            {t.mode || "-"}
          </span>
        </td>
        <td>{t.description || "-"}</td>
      </tr>
    ))
  )}
</tbody>
</table>

{showFilter && (
  <div className={`filter-overlay ${isClosing ? "closing" : ""}`}>
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={closeFilter}>✕</button>
      </div>

      <div className="filter-body">
        <label>Category</label>
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option value="">All</option>
          <option value="Bills">Bills</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Transport">Transport</option>
          <option value="Others">Others</option>
          <option value="General">General</option>
        </select>

        <label>Payment Mode</label>
        <select
          value={filters.mode}
          onChange={(e) =>
            setFilters({ ...filters, mode: e.target.value })
          }
        >
          <option value="">All</option>
          <option value="cash">Cash</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
          <option value="swish">Swish</option>
        </select>

        <label>Min Amount</label>
        <input
          type="number"
          value={filters.minAmount}
          onChange={(e) =>
            setFilters({ ...filters, minAmount: e.target.value })
          }
        />

        <label>Max Amount</label>
        <input
          type="number"
          value={filters.maxAmount}
          onChange={(e) =>
            setFilters({ ...filters, maxAmount: e.target.value })
          }
        />

        <label>Start Date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />

        <label>End Date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
        />

        <label>Sort By</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">None</option>        {/* 🔥 None option */}
          <option value="date_desc">Date (Newest First)</option>
          <option value="date_asc">Date (Oldest First)</option>
          <option value="amount_desc">Amount (High → Low)</option>
          <option value="amount_asc">Amount (Low → High)</option>
        </select>

        <div className="filter-actions">
          <button
            onClick={() => {
              setFilters(defaultFilters);
              setSortOption("");
            }}
          >
            Reset
          </button>

          <button
            className="apply-btn"
            onClick={() => setShowFilter(false)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
)}

       {/* Pagination Controls */}
<div className="pagination">
  <button
    onClick={() => setCurrentPage((prev) => prev - 1)}
    disabled={currentPage === 1}
  >
    <ArrowBigLeft/>
  </button>

  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setCurrentPage(i + 1)}
      className={currentPage === i + 1 ? "active-page" : ""}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage((prev) => prev + 1)}
    disabled={currentPage === totalPages || totalPages === 0}
  >
    <ArrowBigRight/>
  </button>
</div>

      {/* Modal */}
      {showModal && (
        <TransactionModal
          close={() => {
            setShowModal(false);
            setSelectedIds([]);
          }}
          setTransactions={setTransactions}
          editingData={editingData}
        />
      )}

      {showConfirm && (
        <ConfirmDelete
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default Transactions;
