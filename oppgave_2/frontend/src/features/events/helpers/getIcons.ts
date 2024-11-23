import {
  FaBriefcase,
  FaRunning,
  FaCalendar,
  FaUserCheck,
} from "react-icons/fa";
import { FaPeopleGroup, FaUserLock } from "react-icons/fa6";
import { IconType } from "react-icons";

export const getTypeIcon = (typeName: string): IconType => {
  switch (typeName.toLowerCase()) {
    case "trening":
      return FaRunning;
    case "sosialt":
      return FaPeopleGroup;
    case "møte":
      return FaBriefcase;
    default:
      return FaCalendar;
  }
};

export const getStatusIcon = (status: string): IconType => {
  return status === "Ledige plasser" ? FaUserCheck : FaUserLock;
};
