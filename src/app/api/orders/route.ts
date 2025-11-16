import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const itemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  color: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
})

const createOrderSchema = z.object({
  clientId: z.number().int().positive(),
  items: z.array(itemSchema).min(1),
  isPartial: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get('auth_user')?.value
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 })
    const me = JSON.parse(raw) as { id: number }

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => i.message).join(', ')
      return NextResponse.json({ ok: false, error: msg }, { status: 400 })
    }

    const { clientId, items, isPartial } = parsed.data
    const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0)

    const order = await prisma.order.create({
      data: {
        clientId,
        userId: me.id,
        status: 'pending',
        totalAmount: totalAmount as any,
        orderDate: new Date(),
        isPartial: !!isPartial,
      },
    })

    if (items.length > 0) {
      await prisma.orderDetail.createMany({
        data: items.map(it => ({
          orderId: order.id,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice as any,
          totalPrice: it.totalPrice as any,
          clientId,
          status: 'pending',
          isProduced: false,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 })
  } catch (e: any) {
    const msg = e?.message || 'Error al crear pedido'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function GET() {
  try {
    const details = await prisma.orderDetail.findMany({
      orderBy: { id: 'asc' },
      include: {
        order: true,
        product: true,
        client: true,
      },
    })

    const normalized = details.map(d => ({
      id: d.id,
      productId: d.productId,
      productName: d.product?.name ?? '',
      type: d.product?.type ?? '',
      application: d.product?.application ?? '',
      color: '',
      quantity: d.quantity,
      unitPrice: Number(d.unitPrice as any),
      totalPrice: Number(d.totalPrice as any),
      orderId: d.orderId,
      clientId: d.clientId,
      status: d.status as any,
      isProduced: d.isProduced,
      orderDate: d.order?.orderDate ?? null,
      clientName: d.client?.name ?? '',
    }))

    return NextResponse.json({ ok: true, details: normalized }, { status: 200 })
  } catch (e: any) {
    const msg = e?.message || 'Error al obtener pedidos'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}