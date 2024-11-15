"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUsers } from "react-icons/fa";
import { fetcher } from "@/api/fetcher";
import { Template } from "../interfaces";

const AdminDashboard = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetcher("/templates");
        setTemplates(response.templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  const TemplateForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      allowedDays: [] as string[],
      maxCapacity: 0,
      price: 0,
      isPrivate: false,
      allowWaitlist: false,
      allowSameDay: true,
    });

    const daysOfWeek = [
      "Mandag",
      "Tirsdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lørdag",
      "Søndag",
    ];

    const handleDayToggle = (day: string) => {
      setFormData((prev) => ({
        ...prev,
        allowedDays: prev.allowedDays.includes(day)
          ? prev.allowedDays.filter((d) => d !== day)
          : [...prev.allowedDays, day],
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await fetcher("/templates", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setShowNewTemplateForm(false);
      } catch (error) {
        console.error("Error creating template:", error);
      }
    };

    return (
      <div className="template-form-container">
        <h3>Opprett ny mal</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Navn på mal</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Tillatte dager</label>
            <div className="days-container">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`day-btn ${
                    formData.allowedDays.includes(day) ? "selected" : ""
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kapasitet</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxCapacity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Pris</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({ ...formData, isPrivate: e.target.checked })
                }
              />
              Privat arrangement
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.allowWaitlist}
                onChange={(e) =>
                  setFormData({ ...formData, allowWaitlist: e.target.checked })
                }
              />
              Tillat venteliste
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.allowSameDay}
                onChange={(e) =>
                  setFormData({ ...formData, allowSameDay: e.target.checked })
                }
              />
              Tillat samme dag
            </label>
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="admin-btn btn"
              onClick={() => setShowNewTemplateForm(false)}
            >
              Avbryt
            </button>
            <button type="submit" className="admin-btn primary-btn btn">
              Lagre mal
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Administrasjonspanel</h2>
        <div className="admin-btn-wrapper">
          <button
            className="admin-btn btn"
            onClick={() => setShowNewTemplateForm(true)}
          >
            <FaPlus /> Ny mal
          </button>
          <button
            className="admin-btn primary-btn btn"
            onClick={() => setShowNewEventForm(true)}
          >
            <FaPlus /> Nytt arrangement
          </button>
        </div>
      </div>

      {showNewTemplateForm && <TemplateForm />}

      <div className="templates-section">
        <h3>Maler</h3>
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>
                  Kapasitet: {template.maxCapacity} | Pris: {template.price} kr
                </p>
              </div>
              <div className="template-actions">
                <button
                  className="icon-btn edit"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <FaEdit />
                </button>
                <button className="icon-btn delete">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
