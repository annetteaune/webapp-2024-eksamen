"use client";
import { FaTimes } from "react-icons/fa";
import { Event } from "@/features/events/interfaces";
import { useEventForm } from "../hooks/useEventForm";

interface EventFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Event, "id" | "status" | "waitlist">) => Promise<void>;
  initialData?: Event;
}

export default function EventForm({
  onClose,
  onSubmit,
  initialData,
}: EventFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    types,
    templates,
    minDate,
    maxDate,
    handleDateChange,
    handleAllowSameDayChange,
    handleInputChange,
    handleSubmit,
    applyTemplate,
  } = useEventForm({ onSubmit, onClose, initialData });

  return (
    <div className="modal">
      <div className="modal-content event-form-container">
        <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
          <FaTimes />
        </button>
        <h3>
          {initialData ? "Rediger arrangement" : "Opprett nytt arrangement"}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Mal (valgfritt)</label>
            <select
              value={formData.templateId || ""}
              onChange={(e) => applyTemplate(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Ingen mal</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>URL-slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              className={errors.slug ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.slug && (
              <span className="error-message">{errors.slug}</span>
            )}
          </div>

          <div className="form-group">
            <label>Tittel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label>Kort beskrivelse</label>
            <input
              type="text"
              value={formData.descriptionShort}
              onChange={(e) =>
                handleInputChange("descriptionShort", e.target.value)
              }
              className={errors.descriptionShort ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.descriptionShort && (
              <span className="error-message">{errors.descriptionShort}</span>
            )}
          </div>

          <div className="form-group">
            <label>Lang beskrivelse</label>
            <textarea
              value={formData.descriptionLong}
              onChange={(e) =>
                handleInputChange("descriptionLong", e.target.value)
              }
              className={errors.descriptionLong ? "error" : ""}
              disabled={isSubmitting}
              rows={5}
            />
            {errors.descriptionLong && (
              <span className="error-message">{errors.descriptionLong}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dato og tid</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={`${minDate}T00:00`}
                max={`${maxDate}T23:59`}
                className={errors.date ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.date && (
                <span className="error-message">{errors.date}</span>
              )}
              {formData.templateId && (
                <span className="allowed-days">
                  Tillatte dager:{" "}
                  {templates
                    .find((t) => t.id === formData.templateId)
                    ?.allowedDays.join(", ")}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Lokasjon</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={errors.location ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.location && (
                <span className="error-message">{errors.location}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
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
              <label>Kapasitet</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  handleInputChange("capacity", parseInt(e.target.value))
                }
                className={errors.capacity ? "error" : ""}
                disabled={isSubmitting || !!formData.templateId}
              />
              {errors.capacity && (
                <span className="error-message">{errors.capacity}</span>
              )}
            </div>

            <div className="form-group">
              <label>Pris</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseInt(e.target.value))
                }
                className={errors.price ? "error" : ""}
                disabled={Boolean(
                  isSubmitting ||
                    (formData.templateId &&
                      templates.find((t) => t.id === formData.templateId)
                        ?.fixedPrice)
                )}
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    handleInputChange("isPrivate", e.target.checked)
                  }
                  disabled={isSubmitting || !!formData.templateId}
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
                  disabled={isSubmitting || Boolean(formData.templateId)}
                />
                Tillat venteliste
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={formData.allowSameDay}
                  onChange={(e) => handleAllowSameDayChange(e.target.checked)}
                  disabled={isSubmitting || Boolean(formData.templateId)}
                />
                Tillat på samme dag som andre arrangementer
              </label>
            </div>
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
                ? "Oppdater arrangement"
                : "Opprett arrangement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
