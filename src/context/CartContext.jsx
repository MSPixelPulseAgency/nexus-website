import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CartContext from "./cart-context";
import { courses } from "../data/catalog";

const STORAGE_KEY = "nexus-course-cart";
function readCart() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const codes = Array.isArray(parsed) ? [...new Set(parsed.map((item) => item?.code))] : [];
    return codes.map((code) => courses.find((course) => course.code === code)).filter(Boolean);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => (typeof window === "undefined" ? [] : readCart()));
  const [announcement, setAnnouncement] = useState("");
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be blocked or full. Keep the current visit usable.
      setAnnouncement("Your course selections are available for this visit. This browser could not save them for later.");
    }
  }, [items]);

  const addCourse = useCallback((course) => {
    if (itemsRef.current.some((item) => item.code === course.code)) {
      setAnnouncement(`${course.code} is already in your course cart.`);
      return;
    }
    const nextItems = [...itemsRef.current, {
      code: course.code,
      title: course.title,
      slug: course.slug,
      grade: course.grade,
      type: course.type,
      credit: course.credit,
      prerequisite: course.prerequisite,
      department: course.department,
    }];
    itemsRef.current = nextItems;
    setAnnouncement(`${course.code} was added to your course cart.`);
    setItems(nextItems);
  }, []);

  const removeCourse = useCallback((code) => {
    const nextItems = itemsRef.current.filter((item) => item.code !== code);
    itemsRef.current = nextItems;
    setItems(nextItems);
    setAnnouncement(`${code} was removed from your course cart.`);
  }, []);

  const clearCart = useCallback(() => {
    itemsRef.current = [];
    setItems([]);
    setAnnouncement("Your course cart was cleared.");
  }, []);

  const value = useMemo(() => ({
    items,
    count: items.length,
    announcement,
    addCourse,
    removeCourse,
    clearCart,
    hasCourse: (code) => items.some((item) => item.code === code),
  }), [addCourse, announcement, clearCart, items, removeCourse]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    </CartContext.Provider>
  );
}
