'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight, Receipt } from 'lucide-react'
import { parseVastikeBreakdown } from '@/lib/types'
import { VastikeBreakdownDisplay } from './vastike-breakdown-display'
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => {
          const breakdown = parseVastikeBreakdown(expense.vastike_breakdown)
          const hasBreakdown = breakdown !== null
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
              </TableRow>

              {hasBreakdown && isExpanded && (
                <TableRow key={`${expense.id}-breakdown`}>
                  <TableCell colSpan={5} className="bg-muted/30">
                    <div className="py-2 px-8">
                      <div className="text-sm font-medium mb-2">Vastikkeen erittely:</div>
                      <VastikeBreakdownDisplay breakdown={breakdown} />
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
