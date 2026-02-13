import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientSchema, InsertPatient } from "@shared/schema";
import { useCreatePatient } from "@/hooks/use-patients";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function CreatePatient() {
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreatePatient();
  
  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: "Male",
      condition: "",
      isActive: true,
    },
  });

  function onSubmit(data: InsertPatient) {
    mutate(data, {
      onSuccess: () => setLocation("/"),
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-border/50 shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Admit New Patient</CardTitle>
          <CardDescription>Enter patient demographics and initial diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            className="bg-background border-border" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Diagnosis / Condition</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cardiac Arrest, Trauma, Post-Op" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setLocation("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Patient
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
