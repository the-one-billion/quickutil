"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

type SchemaType = { type?: string; properties?: Record<string, SchemaType>; required?: string[]; items?: SchemaType; enum?: unknown[]; minimum?: number; maximum?: number; minLength?: number; maxLength?: number };

function validate(data: unknown, schema: SchemaType, path = ""): string[] {
  const errors: string[] = [];
  const loc = path || "root";

  if (schema.type) {
    const t = schema.type;
    const actual = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
    if (t !== actual) errors.push(`${loc}: expected ${t}, got ${actual}`);
  }

  if (schema.enum && !schema.enum.some(v => JSON.stringify(v) === JSON.stringify(data))) {
    errors.push(`${loc}: value not in enum [${schema.enum.join(", ")}]`);
  }

  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) errors.push(`${loc}: ${data} < minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && data > schema.maximum) errors.push(`${loc}: ${data} > maximum ${schema.maximum}`);
  }

  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) errors.push(`${loc}: length ${data.length} < minLength ${schema.minLength}`);
    if (schema.maxLength !== undefined && data.length > schema.maxLength) errors.push(`${loc}: length ${data.length} > maxLength ${schema.maxLength}`);
  }

  if (schema.properties && typeof data === "object" && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) errors.push(`${loc}: missing required property "${key}"`);
      }
    }
    for (const [key, subSchema] of Object.entries(schema.properties)) {
      if (key in obj) errors.push(...validate(obj[key], subSchema, `${loc}.${key}`));
    }
  }

  if (schema.items && Array.isArray(data)) {
    data.forEach((item, i) => errors.push(...validate(item, schema.items!, `${loc}[${i}]`)));
  }

  return errors;
}

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["name", "age"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age":  { "type": "number", "minimum": 0, "maximum": 150 },
    "email":{ "type": "string" }
  }
}`;

const EXAMPLE_DATA = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com"
}`;

export default function JSONSchemaValidator() {
  const [schema, setSchema] = useState(EXAMPLE_SCHEMA);
  const [data,   setData]   = useState(EXAMPLE_DATA);
  const [errors, setErrors] = useState<string[] | null>(null);
  const [parseErr, setParseErr] = useState("");

  const validate_ = () => {
    setParseErr("");
    let parsedSchema: SchemaType, parsedData: unknown;
    try { parsedSchema = JSON.parse(schema); } catch { setParseErr("Schema is not valid JSON"); return; }
    try { parsedData   = JSON.parse(data);   } catch { setParseErr("Data is not valid JSON");   return; }
    setErrors(validate(parsedData, parsedSchema));
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1 block">JSON Schema</Label>
          <Textarea value={schema} onChange={e => setSchema(e.target.value)} rows={12} className="font-mono text-xs" />
        </div>
        <div>
          <Label className="mb-1 block">JSON Data</Label>
          <Textarea value={data} onChange={e => setData(e.target.value)} rows={12} className="font-mono text-xs" />
        </div>
      </div>
      {parseErr && <p className="text-sm text-destructive">{parseErr}</p>}
      <Button onClick={validate_}>Validate</Button>
      {errors !== null && (
        <div className={`rounded-lg border p-4 space-y-2 ${errors.length === 0 ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
          <div className="flex items-center gap-2">
            {errors.length === 0
              ? <><CheckCircle className="h-5 w-5 text-green-600" /><span className="font-semibold text-green-600">Valid — no errors found</span></>
              : <><XCircle className="h-5 w-5 text-destructive" /><span className="font-semibold text-destructive">{errors.length} validation error{errors.length > 1 ? "s" : ""}</span></>
            }
          </div>
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-destructive font-mono">• {e}</p>
          ))}
        </div>
      )}
    </div>
  );
}
