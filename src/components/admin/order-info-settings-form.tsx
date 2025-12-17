"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  saveOrderInfoSettings,
  type OrderInfoSettings,
} from "@/actions/settings.actions";

interface OrderInfoSettingsFormProps {
  initialSettings: OrderInfoSettings;
}

const orderStepSchema = z.object({
  id: z.string(),
  stepEn: z.string().min(1, "English step is required").max(500),
  stepUk: z.string().min(1, "Ukrainian step is required").max(500),
  order: z.number(),
});

const deliveryInfoSchema = z.object({
  id: z.string(),
  titleEn: z.string().min(1, "English title is required").max(200),
  titleUk: z.string().min(1, "Ukrainian title is required").max(200),
  descriptionEn: z.string().max(1000).optional(),
  descriptionUk: z.string().max(1000).optional(),
  order: z.number(),
});

const paymentMethodSchema = z.object({
  id: z.string(),
  nameEn: z.string().min(1, "English name is required").max(200),
  nameUk: z.string().min(1, "Ukrainian name is required").max(200),
  order: z.number(),
});

const formSchema = z.object({
  orderSteps: z.array(orderStepSchema),
  deliveryInfo: z.array(deliveryInfoSchema),
  paymentMethods: z.array(paymentMethodSchema),
});

type FormInput = z.infer<typeof formSchema>;

export function OrderInfoSettingsForm({
  initialSettings,
}: OrderInfoSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderSteps: initialSettings.orderSteps.length > 0
        ? initialSettings.orderSteps
        : [],
      deliveryInfo: initialSettings.deliveryInfo.length > 0
        ? initialSettings.deliveryInfo
        : [],
      paymentMethods: initialSettings.paymentMethods.length > 0
        ? initialSettings.paymentMethods
        : [],
    },
  });

  const {
    fields: orderStepFields,
    append: appendOrderStep,
    remove: removeOrderStep,
  } = useFieldArray({
    control: form.control,
    name: "orderSteps",
  });

  const {
    fields: deliveryInfoFields,
    append: appendDeliveryInfo,
    remove: removeDeliveryInfo,
  } = useFieldArray({
    control: form.control,
    name: "deliveryInfo",
  });

  const {
    fields: paymentMethodFields,
    append: appendPaymentMethod,
    remove: removePaymentMethod,
  } = useFieldArray({
    control: form.control,
    name: "paymentMethods",
  });

  async function onSubmit(data: FormInput) {
    setIsSaving(true);
    try {
      const normalizedData = {
        orderSteps: data.orderSteps.map((step, index) => ({
          ...step,
          order: index,
        })),
        deliveryInfo: data.deliveryInfo.map((item, index) => ({
          ...item,
          descriptionEn: item.descriptionEn || "",
          descriptionUk: item.descriptionUk || "",
          order: index,
        })),
        paymentMethods: data.paymentMethods.map((method, index) => ({
          ...method,
          order: index,
        })),
      };
      await saveOrderInfoSettings(normalizedData);
      toast.success("Order information settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order Information
        </CardTitle>
        <CardDescription>
          Configure how to order steps, delivery info, and payment methods displayed on the contacts page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="multiple" defaultValue={["order-steps", "delivery", "payment"]} className="space-y-4">
              {/* Order Steps Section */}
              <AccordionItem value="order-steps" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>How to Order ({orderStepFields.length} steps)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Step-by-step ordering process displayed on the contacts page
                  </p>

                  {orderStepFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`orderSteps.${index}.stepEn`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Step (EN)</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose your favorite model" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`orderSteps.${index}.stepUk`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Step (UK)</FormLabel>
                              <FormControl>
                                <Input placeholder="Виберіть улюблену модель" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOrderStep(index)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendOrderStep({
                        id: crypto.randomUUID(),
                        stepEn: "",
                        stepUk: "",
                        order: orderStepFields.length,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Delivery Info Section */}
              <AccordionItem value="delivery" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Delivery Information ({deliveryInfoFields.length} items)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Delivery terms and conditions displayed on the contacts page
                  </p>

                  {deliveryInfoFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/30 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDeliveryInfo(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`deliveryInfo.${index}.titleEn`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title (EN)</FormLabel>
                              <FormControl>
                                <Input placeholder="Worldwide Delivery" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`deliveryInfo.${index}.titleUk`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title (UK)</FormLabel>
                              <FormControl>
                                <Input placeholder="Міжнародна доставка" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`deliveryInfo.${index}.descriptionEn`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (EN) - optional</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Delivery by EMS Post Service"
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`deliveryInfo.${index}.descriptionUk`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (UK) - optional</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Доставка через EMS Post Service"
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendDeliveryInfo({
                        id: crypto.randomUUID(),
                        titleEn: "",
                        titleUk: "",
                        descriptionEn: "",
                        descriptionUk: "",
                        order: deliveryInfoFields.length,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Delivery Item
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Payment Methods Section */}
              <AccordionItem value="payment" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Methods ({paymentMethodFields.length} methods)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Available payment methods displayed on the contacts page
                  </p>

                  {paymentMethodFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`paymentMethods.${index}.nameEn`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name (EN)</FormLabel>
                              <FormControl>
                                <Input placeholder="Bank account transfer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`paymentMethods.${index}.nameUk`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name (UK)</FormLabel>
                              <FormControl>
                                <Input placeholder="Банківський переказ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePaymentMethod(index)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendPaymentMethod({
                        id: crypto.randomUUID(),
                        nameEn: "",
                        nameUk: "",
                        order: paymentMethodFields.length,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Order Information"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
