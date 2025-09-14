/**
 * @fileoverview A prototype checkout page for the LMS.
 * This page simulates the payment process for a selected plan.
 */
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedDiv } from '@/components/AnimatedDiv';

/**
 * Zod schema for validating the checkout form fields.
 */
const checkoutSchema = z.object({
  nameOnCard: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().length(16, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cvc: z.string().length(3, 'CVC must be 3 digits'),
});

/**
 * Renders a prototype checkout page with a payment form and order summary.
 * @returns {JSX.Element} The checkout page component.
 */
export default function CheckoutPage() {
    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            nameOnCard: '',
            cardNumber: '',
            expiryDate: '',
            cvc: '',
        },
    });

    /**
     * Handles the form submission by showing a success toast.
     * In a real application, this would connect to a payment processor.
     * @param {z.infer<typeof checkoutSchema>} data - The validated form data.
     */
    const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
        toast.success('Payment Successful!', {
            description: 'This is a prototype. No payment was actually processed.',
        });
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <AnimatedDiv>
              <PageHeader
                  title="Secure Checkout"
                  description="Complete your purchase for the 'Human Tutoring' plan."
              />
            </AnimatedDiv>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <AnimatedDiv delay={100}>
                  <Card className="bg-card/50 backdrop-blur-lg">
                      <CardHeader>
                          <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Human Tutoring Plan</span>
                              <span>$299.00</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Tax (10%)</span>
                              <span>$29.90</span>
                          </div>
                           <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                              <span>Total</span>
                              <span>$328.90</span>
                          </div>
                      </CardContent>
                  </Card>
                </AnimatedDiv>
                
                <AnimatedDiv delay={200}>
                  <Card className="bg-card/50 backdrop-blur-lg">
                       <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)}>
                              <CardHeader>
                                  <CardTitle>Payment Details</CardTitle>
                                  <CardDescription>All transactions are secure and encrypted.</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <FormField
                                      control={form.control}
                                      name="nameOnCard"
                                      render={({ field }) => (
                                          <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                      )}
                                  />
                                  <FormField
                                      control={form.control}
                                      name="cardNumber"
                                      render={({ field }) => (
                                          <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                      )}
                                  />
                                  <div className="flex gap-4">
                                       <FormField
                                          control={form.control}
                                          name="expiryDate"
                                          render={({ field }) => (
                                              <FormItem className="flex-1"><FormLabel>Expiry (MM/YY)</FormLabel><FormControl><Input {...field} placeholder="MM/YY" /></FormControl><FormMessage /></FormItem>
                                          )}
                                      />
                                       <FormField
                                          control={form.control}
                                          name="cvc"
                                          render={({ field }) => (
                                              <FormItem className="flex-1"><FormLabel>CVC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                          )}
                                      />
                                  </div>
                              </CardContent>
                              <CardFooter>
                                  <Button type="submit" className="w-full" size="lg">
                                      <Lock className="mr-2 h-4 w-4" />
                                      Pay $328.90
                                  </Button>
                              </CardFooter>
                          </form>
                      </Form>
                  </Card>
                </AnimatedDiv>
            </div>
        </div>
    );
}
