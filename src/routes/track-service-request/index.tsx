import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle, Circle, Clock, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export const Route = createFileRoute('/track-service-request/')({
    validateSearch: z.object({
        ref: z.string().optional(),
    }),
    component: TrackServiceRequest,
})

const refSchema = z.string().min(1, 'Enter a reference number');

type Status = 'completed' | 'current' | 'pending'

const steps = [
    { label: 'Submitted', description: 'Your request has been received.' },
    { label: 'Assigned', description: 'A technician has been assigned to your request.' },
    { label: 'In Progress', description: 'Work is currently underway.' },
    { label: 'Resolved', description: 'Your request has been completed.' },
]

function getStatus(index: number, current: number): Status {
    if (index < current) return 'completed'
    if (index === current) return 'current'
    return 'pending'
}

const CURRENT_STEP = 1

function StepIcon({ status }: { status: Status }) {
    if (status === 'completed') return <CheckCircle className="w-7 h-7 text-primary" />
    if (status === 'current') return <Clock className="w-7 h-7 text-primary" />
    return <Circle className="w-7 h-7 text-outline" />
}

function TrackServiceRequest() {
    const { ref } = Route.useSearch()
    const navigate = useNavigate()
    const [input, setInput] = useState('')
    const [isLooking, setIsLooking] = useState(false)
    const [inputError, setInputError] = useState<string | undefined>()

    async function handleLookup() {
        const result = refSchema.safeParse(input.trim())
        if (!result.success) {
            setInputError(result.error.issues[0].message)
            return
        }
        setInputError(undefined)
        setIsLooking(true)
        await new Promise(r => setTimeout(r, 1000))
        navigate({ to: '/track-service-request', search: { ref: input.trim() } })
        setIsLooking(false)
    }

    return (
        <>
            <header className="border-b border-outline">
                <div className="py-6 max-w-7xl mx-auto px-6">
                    <Link to="/" className="flex items-center space-x-3">
                        <img
                            src="/assets/images/knust-logo.png"
                            alt="KNUST Crest"
                            className="h-14 w-auto"
                        />
                        <div className="pt-4 flex flex-col">
                            <h1 className="font-garamond font-semibold text-xl tracking-tight m-0 leading-tight">
                                KNUST
                            </h1>
                            <p className="text-[0.7rem] font-medium m-0 -mt-0.5 leading-normal">
                                Central Energy Database
                            </p>
                        </div>
                    </Link>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-6 py-12 space-y-8">
                <div className="flex flex-col gap-1">
                    <h2 className="font-display text-2xl font-semibold tracking-tight">Track Request</h2>
                    {ref ? (
                        <p className="text-sm text-muted-foreground">
                            Reference: <span className="font-medium text-ink">{ref}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Enter reference number to track your request.
                        </p>
                    )}
                </div>

                {!ref ? (
                    <div className="bg-white border border-outline rounded-2xl p-4 md:p-8 space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="ref" className="text-sm font-medium">
                                Reference Number
                            </label>
                            <Input
                                id="ref"
                                placeholder="SR-20240001"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value)
                                    setInputError(undefined)
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                aria-invalid={!!inputError}
                            />
                            {inputError && (
                                <p className="text-xs text-destructive">{inputError}</p>
                            )}
                        </div>
                        <Button className="w-full" size='lg' onClick={handleLookup} disabled={isLooking}>
                            {isLooking ? <Loader2 className="animate-spin" /> : 'Track'}
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white border border-outline rounded-2xl p-8">
                        <ol className="relative flex flex-col gap-0">
                            {steps.map((step, i) => {
                                const status = getStatus(i, CURRENT_STEP)
                                const isLast = i === steps.length - 1

                                return (
                                    <li key={step.label} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <StepIcon status={status} />
                                            {!isLast && (
                                                <div
                                                    className={`w-0.5 flex-1 my-1 rounded-full ${status === 'completed' ? 'bg-primary' : 'bg-outline'
                                                        }`}
                                                />
                                            )}
                                        </div>

                                        <div className={`${isLast ? 'pb-0' : 'pb-8'}`}>
                                            <p
                                                className={`font-medium leading-tight mt-0.5 ${status === 'pending' ? 'text-muted-foreground' : 'text-ink'
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            {status !== 'pending' && (
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ol>

                        <button
                            onClick={() => navigate({ to: '/track-service-request' })}
                            className="mt-6 text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                        >
                            Track a different request
                        </button>
                    </div>
                )}
            </main>
        </>
    )
}