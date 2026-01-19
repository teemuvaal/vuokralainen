'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ChevronDown, ChevronRight, Receipt, Pencil, Trash2, Loader2 } from 'lucide-react'
import { parseVastikeBreakdown, parseLainaBreakdown } from '@/lib/types'
import { VastikeBreakdownDisplay } from './vastike-breakdown-display'
import { LainaBreakdownDisplay } from './laina-breakdown-display'
import { ExpenseForm } from './expense-form'
import { deleteExpense } from '@/lib/actions/expenses'
import type { Database } from '@/lib/database.types'

type Expense = Database['public']['Tables']['expenses']['Row']
type Property = Database['public']['Tables']['properties']['Row']
type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']

interface ExpenseListProps {
  expenses: Expense[]
  propertyMap: Record<string, Property>
  categoryMap: Record<string, ExpenseCategory>
}

export function ExpenseList({ expenses, propertyMap, categoryMap }: ExpenseListProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Convert maps to arrays for ExpenseForm
  const properties = Object.values(propertyMap)
  const categories = Object.values(categoryMap)

  async function handleDelete(expenseId: string) {
    setIsDeleting(true)
    const result = await deleteExpense(expenseId)
    setIsDeleting(false)

    if (result?.success) {
      setDeleteDialogOpen(null)
    }
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Ei vielä kuluja</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Päivämäärä</TableHead>
          <TableHead>Kohde</TableHead>
          <TableHead>Kategoria</TableHead>
          <TableHead>Kuvaus</TableHead>
          <TableHead className="text-right">Summa</TableHead>
          <TableHead className="text-right">Toiminnot</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => {
          const vastikeBreakdown = parseVastikeBreakdown(expense.vastike_breakdown)
          const lainaBreakdown = parseLainaBreakdown(expense.laina_breakdown)
          const hasBreakdown = vastikeBreakdown !== null || lainaBreakdown !== null
          const isExpanded = expandedRows.has(expense.id)

          return (
            <>
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {hasBreakdown && (
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedRows)
                          if (isExpanded) {
                            newExpanded.delete(expense.id)
                          } else {
                            newExpanded.add(expense.id)
                          }
                          setExpandedRows(newExpanded)
                        }}
                        className="hover:bg-muted p-1 rounded"
                        aria-label={isExpanded ? 'Piilota erittely' : 'Näytä erittely'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    {new Date(expense.expense_date).toLocaleDateString('fi-FI')}
                  </div>
                </TableCell>
                <TableCell>
                  {expense.property_id && propertyMap[expense.property_id]?.name || '-'}
                </TableCell>
                <TableCell>
                  {expense.category_id && categoryMap[expense.category_id] ? (
                    <Badge variant="outline">
                      {categoryMap[expense.category_id].name}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {expense.description || '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-red-600">
                  -{Number(expense.amount).toLocaleString('fi-FI')} €
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Edit Dialog */}
                    <Dialog
                      open={editDialogOpen === expense.id}
                      onOpenChange={(open) => setEditDialogOpen(open ? expense.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label="Muokkaa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Muokkaa kulua</DialogTitle>
                          <DialogDescription>
                            Tee muutokset kulun tietoihin alla.
                          </DialogDescription>
                        </DialogHeader>
                        <ExpenseForm
                          properties={properties}
                          categories={categories}
                          expense={expense}
                          onSuccess={() => setEditDialogOpen(null)}
                        />
                      </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                      open={deleteDialogOpen === expense.id}
                      onOpenChange={(open) => setDeleteDialogOpen(open ? expense.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="Poista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Poista kulu</DialogTitle>
                          <DialogDescription>
                            Haluatko varmasti poistaa tämän kulun? Tätä toimintoa ei voi perua.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-2 text-sm">
                            <p><strong>Summa:</strong> {Number(expense.amount).toLocaleString('fi-FI')} €</p>
                            <p><strong>Päivämäärä:</strong> {new Date(expense.expense_date).toLocaleDateString('fi-FI')}</p>
                            {expense.category_id && categoryMap[expense.category_id] && (
                              <p><strong>Kategoria:</strong> {categoryMap[expense.category_id].name}</p>
                            )}
                            {expense.description && (
                              <p><strong>Kuvaus:</strong> {expense.description}</p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(null)}
                            disabled={isDeleting}
                          >
                            Peruuta
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(expense.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Poistetaan...
                              </>
                            ) : (
                              'Poista kulu'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>

              {hasBreakdown && isExpanded && (
                <TableRow key={`${expense.id}-breakdown`}>
                  <TableCell colSpan={6} className="bg-muted/30">
                    <div className="py-2 px-8 space-y-4">
                      {vastikeBreakdown && (
                        <div>
                          <div className="text-sm font-medium mb-2">Vastikkeen erittely:</div>
                          <VastikeBreakdownDisplay breakdown={vastikeBreakdown} />
                        </div>
                      )}
                      {lainaBreakdown && (
                        <div>
                          <div className="text-sm font-medium mb-2">Lainanmaksun erittely:</div>
                          <LainaBreakdownDisplay breakdown={lainaBreakdown} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )
        })}
      </TableBody>
    </Table>
  )
}
