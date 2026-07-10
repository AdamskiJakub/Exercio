import { useCallback } from "react";

/**
 * Generic hook for managing array fields in a form state.
 * Eliminates duplicated add/update/remove patterns for array-type fields.
 */
export function useArrayField<T extends Record<string, any>>(
  field: keyof T,
  setForm: React.Dispatch<React.SetStateAction<T>>,
  createEmpty: () => any,
) {
  const add = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      [field]: [...((prev[field] as any[]) || []), createEmpty()],
    }));
  }, [field, setForm, createEmpty]);

  const update = useCallback(
    (index: number, subField: string, value: any) => {
      setForm((prev) => {
        const items = [...((prev[field] as any[]) || [])];
        items[index] = { ...items[index], [subField]: value };
        return { ...prev, [field]: items };
      });
    },
    [field, setForm],
  );

  const remove = useCallback(
    (index: number) => {
      setForm((prev) => ({
        ...prev,
        [field]: ((prev[field] as any[]) || []).filter((_, i) => i !== index),
      }));
    },
    [field, setForm],
  );

  return { add, update, remove };
}
