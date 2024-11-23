"use client";
import { FaTimes } from "react-icons/fa";
import { Template } from "../interfaces";
import { useTemplateForm } from "../hooks/useTemplateForm";

interface TemplateFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Template, "id" | "createdAt">) => Promise<void>;
  initialData?: Template;
}

export const NewTemplateForm = ({
  onClose,
  onSubmit,
  initialData,
}: TemplateFormProps) => {
  const {
    formData,
    types,
    errors,
    isSubmitting,
    daysOfWeek,
    handleDayToggle,
    handleInputChange,
    handleSubmit,
  } = useTemplateForm({ onSubmit, onClose, initialData });

  return (
    <div className="modal">
      <div className="modal-content template-form-container">
        <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
          <FaTimes />
        </button>
        <h3>{initialData ? "Rediger mal" : "Opprett ny mal"}</h3>

        {errors._form && <div className="error-message">{errors._form}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Navn på mal</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Type arrangement</label>
            <select
              value={formData.typeId}
              onChange={(e) => handleInputChange("typeId", e.target.value)}
              className={errors.typeId ? "error" : ""}
              disabled={isSubmitting}
            >
              <option value="">Velg type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.typeId && (
              <span className="error-message">{errors.typeId}</span>
            )}
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
                  disabled={isSubmitting}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.allowedDays && (
              <span className="error-message">{errors.allowedDays}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kapasitet</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) =>
                  handleInputChange("maxCapacity", e.target.value)
                }
                className={errors.maxCapacity ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.maxCapacity && (
                <span className="error-message">{errors.maxCapacity}</span>
              )}
            </div>
            <div className="form-group">
              <label>Pris</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={errors.price ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) =>
                  handleInputChange("isPrivate", e.target.checked)
                }
                disabled={isSubmitting}
              />
              Privat arrangement
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.allowWaitlist}
                onChange={(e) =>
                  handleInputChange("allowWaitlist", e.target.checked)
                }
                disabled={isSubmitting}
              />
              Tillat venteliste
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.allowSameDay}
                onChange={(e) =>
                  handleInputChange("allowSameDay", e.target.checked)
                }
                disabled={isSubmitting}
              />
              Tillat på samme dag som andre arrangementer
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.fixedPrice}
                onChange={(e) =>
                  handleInputChange("fixedPrice", e.target.checked)
                }
                disabled={isSubmitting}
              />
              Fast pris
            </label>
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="admin-btn btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="admin-btn primary-btn btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Lagrer..."
                : initialData
                ? "Oppdater mal"
                : "Lagre mal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
